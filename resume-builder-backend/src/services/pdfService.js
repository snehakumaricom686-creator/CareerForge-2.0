const PDFDocument = require('pdfkit');

/**
 * PDF Service for generating resume PDFs
 */
class PDFService {
    /**
     * Generate PDF from resume data
     * @param {Object} resume - Resume document
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async generateResumePDF(resume) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const buffers = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });

                // Header - Personal Info
                this.addHeader(doc, resume.personalInfo);

                // Summary
                if (resume.personalInfo?.summary) {
                    this.addSection(doc, 'Professional Summary');
                    doc.fontSize(10).text(resume.personalInfo.summary, { align: 'justify' });
                    doc.moveDown();
                }

                // Experience
                if (resume.experience && resume.experience.length > 0) {
                    this.addSection(doc, 'Work Experience');
                    resume.experience.forEach((exp, index) => {
                        this.addExperience(doc, exp);
                        if (index < resume.experience.length - 1) doc.moveDown(0.5);
                    });
                    doc.moveDown();
                }

                // Education
                if (resume.education && resume.education.length > 0) {
                    this.addSection(doc, 'Education');
                    resume.education.forEach((edu, index) => {
                        this.addEducation(doc, edu);
                        if (index < resume.education.length - 1) doc.moveDown(0.5);
                    });
                    doc.moveDown();
                }

                // Skills
                if (resume.skills && resume.skills.length > 0) {
                    this.addSection(doc, 'Skills');
                    const skillsText = resume.skills.map(s => `${s.name} (${s.level})`).join(' • ');
                    doc.fontSize(10).text(skillsText);
                    doc.moveDown();
                }

                // Projects
                if (resume.projects && resume.projects.length > 0) {
                    this.addSection(doc, 'Projects');
                    resume.projects.forEach((project, index) => {
                        this.addProject(doc, project);
                        if (index < resume.projects.length - 1) doc.moveDown(0.5);
                    });
                    doc.moveDown();
                }

                // Certifications
                if (resume.certifications && resume.certifications.length > 0) {
                    this.addSection(doc, 'Certifications');
                    resume.certifications.forEach((cert, index) => {
                        this.addCertification(doc, cert);
                        if (index < resume.certifications.length - 1) doc.moveDown(0.3);
                    });
                    doc.moveDown();
                }

                // Languages
                if (resume.languages && resume.languages.length > 0) {
                    this.addSection(doc, 'Languages');
                    const langsText = resume.languages.map(l => `${l.name} (${l.proficiency})`).join(' • ');
                    doc.fontSize(10).text(langsText);
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Add header with personal info
     */
    addHeader(doc, personalInfo) {
        if (!personalInfo) return;

        // Name
        doc.fontSize(24).font('Helvetica-Bold')
            .text(personalInfo.fullName || 'Your Name', { align: 'center' });

        // Contact info line
        const contactInfo = [];
        if (personalInfo.email) contactInfo.push(personalInfo.email);
        if (personalInfo.phone) contactInfo.push(personalInfo.phone);
        if (personalInfo.address) contactInfo.push(personalInfo.address);

        if (contactInfo.length > 0) {
            doc.fontSize(10).font('Helvetica')
                .text(contactInfo.join(' | '), { align: 'center' });
        }

        // Links line
        const links = [];
        if (personalInfo.linkedIn) links.push(`LinkedIn: ${personalInfo.linkedIn}`);
        if (personalInfo.portfolio) links.push(`Portfolio: ${personalInfo.portfolio}`);
        if (personalInfo.github) links.push(`GitHub: ${personalInfo.github}`);

        if (links.length > 0) {
            doc.fontSize(9).fillColor('#0066cc')
                .text(links.join(' | '), { align: 'center' });
        }

        doc.fillColor('#000000').moveDown(1.5);
    }

    /**
     * Add section header
     */
    addSection(doc, title) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333')
            .text(title.toUpperCase());
        doc.moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke('#333333');
        doc.moveDown(0.5).fillColor('#000000');
    }

    /**
     * Add experience entry
     */
    addExperience(doc, exp) {
        doc.fontSize(11).font('Helvetica-Bold')
            .text(exp.position, { continued: true })
            .font('Helvetica').text(` at ${exp.company}`);

        const dateRange = this.formatDateRange(exp.startDate, exp.endDate, exp.current);
        if (exp.location) {
            doc.fontSize(9).fillColor('#666666')
                .text(`${exp.location} | ${dateRange}`);
        } else {
            doc.fontSize(9).fillColor('#666666').text(dateRange);
        }

        doc.fillColor('#000000');

        if (exp.description) {
            doc.fontSize(10).text(exp.description, { align: 'justify' });
        }

        if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach(achievement => {
                doc.fontSize(10).text(`• ${achievement}`, { indent: 10 });
            });
        }
    }

    /**
     * Add education entry
     */
    addEducation(doc, edu) {
        doc.fontSize(11).font('Helvetica-Bold').text(edu.institution);
        doc.font('Helvetica').text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`);

        const dateRange = this.formatDateRange(edu.startDate, edu.endDate);
        let subtext = dateRange;
        if (edu.grade) subtext += ` | Grade: ${edu.grade}`;

        doc.fontSize(9).fillColor('#666666').text(subtext);
        doc.fillColor('#000000');

        if (edu.description) {
            doc.fontSize(10).text(edu.description);
        }
    }

    /**
     * Add project entry
     */
    addProject(doc, project) {
        doc.fontSize(11).font('Helvetica-Bold').text(project.name);

        if (project.technologies && project.technologies.length > 0) {
            doc.fontSize(9).fillColor('#666666')
                .text(`Technologies: ${project.technologies.join(', ')}`);
        }

        doc.fillColor('#000000');

        if (project.description) {
            doc.fontSize(10).text(project.description);
        }

        if (project.link || project.github) {
            const links = [];
            if (project.link) links.push(`Demo: ${project.link}`);
            if (project.github) links.push(`Code: ${project.github}`);
            doc.fontSize(9).fillColor('#0066cc').text(links.join(' | '));
            doc.fillColor('#000000');
        }
    }

    /**
     * Add certification entry
     */
    addCertification(doc, cert) {
        doc.fontSize(10).font('Helvetica-Bold').text(cert.name, { continued: true });
        if (cert.issuer) {
            doc.font('Helvetica').text(` - ${cert.issuer}`);
        } else {
            doc.text('');
        }

        if (cert.date) {
            const date = new Date(cert.date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            });
            doc.fontSize(9).fillColor('#666666').text(date);
            doc.fillColor('#000000');
        }
    }

    /**
     * Format date range
     */
    formatDateRange(startDate, endDate, current = false) {
        const formatDate = (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            });
        };

        const start = formatDate(startDate);
        const end = current ? 'Present' : formatDate(endDate);

        if (start && end) return `${start} - ${end}`;
        if (start) return start;
        return '';
    }
}

module.exports = new PDFService();
