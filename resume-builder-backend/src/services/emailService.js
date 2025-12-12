const nodemailer = require('nodemailer');

/**
 * Email Service for sending Gmail notifications to admin
 * Sends notifications when users login or update their data
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.adminEmail = process.env.ADMIN_EMAIL;
        this.initialized = false;
    }

    /**
     * Initialize the email transporter
     */
    initialize() {
        if (this.initialized) return;

        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD
                }
            });
            this.initialized = true;
            console.log('📧 Email service initialized successfully');
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
        }
    }

    /**
     * Send email notification
     * @param {string} subject - Email subject
     * @param {string} htmlContent - Email HTML content
     */
    async sendNotification(subject, htmlContent) {
        if (!this.initialized) {
            this.initialize();
        }

        if (!this.transporter) {
            console.log('⚠️ Email transporter not available, skipping notification');
            return false;
        }

        try {
            const mailOptions = {
                from: `"Resume Builder" <${process.env.GMAIL_USER}>`,
                to: this.adminEmail,
                subject: subject,
                html: htmlContent
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`📧 Notification sent: ${subject}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            return false;
        }
    }

    /**
     * Notify admin when a new user registers
     * @param {Object} user - User object
     */
    async notifyNewUserRegistration(user) {
        const subject = '🆕 New User Registration - Resume Builder';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New User Registration</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Registered At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This is an automated notification from Resume Builder.
        </p>
      </div>
    `;
        return this.sendNotification(subject, htmlContent);
    }

    /**
     * Notify admin when a user logs in
     * @param {Object} user - User object
     */
    async notifyUserLogin(user) {
        const subject = '🔐 User Login - Resume Builder';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">User Login Detected</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This is an automated notification from Resume Builder.
        </p>
      </div>
    `;
        return this.sendNotification(subject, htmlContent);
    }

    /**
     * Notify admin when user updates their profile
     * @param {Object} user - User object
     * @param {Array} updatedFields - List of updated fields
     */
    async notifyProfileUpdate(user, updatedFields) {
        const subject = '✏️ Profile Update - Resume Builder';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">User Profile Updated</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>User Name:</strong> ${user.name}</p>
          <p><strong>User Email:</strong> ${user.email}</p>
          <p><strong>Updated Fields:</strong> ${updatedFields.join(', ')}</p>
          <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This is an automated notification from Resume Builder.
        </p>
      </div>
    `;
        return this.sendNotification(subject, htmlContent);
    }

    /**
     * Notify admin when user creates a resume
     * @param {Object} user - User object
     * @param {Object} resume - Resume object
     */
    async notifyResumeCreated(user, resume) {
        const subject = '📄 New Resume Created - Resume Builder';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Resume Created</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>User Name:</strong> ${user.name}</p>
          <p><strong>User Email:</strong> ${user.email}</p>
          <p><strong>Resume Title:</strong> ${resume.title}</p>
          <p><strong>Created At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This is an automated notification from Resume Builder.
        </p>
      </div>
    `;
        return this.sendNotification(subject, htmlContent);
    }

    /**
     * Notify admin when user updates a resume
     * @param {Object} user - User object
     * @param {Object} resume - Resume object
     * @param {Array} updatedSections - List of updated sections
     */
    async notifyResumeUpdated(user, resume, updatedSections = []) {
        const subject = '📝 Resume Updated - Resume Builder';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Resume Updated</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>User Name:</strong> ${user.name}</p>
          <p><strong>User Email:</strong> ${user.email}</p>
          <p><strong>Resume Title:</strong> ${resume.title}</p>
          ${updatedSections.length > 0 ? `<p><strong>Updated Sections:</strong> ${updatedSections.join(', ')}</p>` : ''}
          <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This is an automated notification from Resume Builder.
        </p>
      </div>
    `;
        return this.sendNotification(subject, htmlContent);
    }

    /**
     * Notify admin when user deletes a resume
     * @param {Object} user - User object
     * @param {string} resumeTitle - Title of deleted resume
     */
    async notifyResumeDeleted(user, resumeTitle) {
        const subject = '🗑️ Resume Deleted - Resume Builder';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #991b1b;">Resume Deleted</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>User Name:</strong> ${user.name}</p>
          <p><strong>User Email:</strong> ${user.email}</p>
          <p><strong>Deleted Resume:</strong> ${resumeTitle}</p>
          <p><strong>Deleted At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This is an automated notification from Resume Builder.
        </p>
      </div>
    `;
        return this.sendNotification(subject, htmlContent);
    }
}

// Export singleton instance
module.exports = new EmailService();
