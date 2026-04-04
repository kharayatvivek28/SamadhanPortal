import cron from 'node-cron';
import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { emitNotification } from './socketSetup.js';

export const startCronJobs = () => {
  // Run every day at midnight (0 0 * * *)
  // For testing purposes, we can change to '* * * * *' to run every minute
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Job] Running escalation check for overdue complaints...');
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Find complaints Assigned or In Progress that haven't been updated in 7 days
      const overdueComplaints = await Complaint.find({
        status: { $in: ['Assigned', 'In Progress'] },
        updatedAt: { $lt: sevenDaysAgo },
        escalationLevel: { $lt: 1 } // Only escalate once initially
      });

      if (overdueComplaints.length === 0) {
        console.log('[Cron Job] No overdue complaints found.');
        return;
      }

      console.log(`[Cron Job] Found ${overdueComplaints.length} overdue complaints.`);

      const admins = await User.find({ role: 'admin' });

      for (const complaint of overdueComplaints) {
        complaint.escalationLevel = 1;
        await complaint.save();

        // Add System History entry about escalation
        await ComplaintHistory.create({
          complaint: complaint._id,
          role: 'system',
          message: 'System auto-escalated complaint due to 7 days of inactivity.',
          statusChangedTo: null
        });

        // Notify Admins
        for (const admin of admins) {
          try {
            const notif = await Notification.create({
              userId: admin._id,
              message: `Escalation: Complaint #${complaint.complaintId} has been inactive for 7 days.`,
              type: 'escalation'
            });
            emitNotification(admin._id, notif);
          } catch (e) {
            console.error('Failed to notify admin on escalation', e.message);
          }
        }
      }
    } catch (error) {
      console.error('[Cron Job] Error running escalation job:', error);
    }
  });
};
