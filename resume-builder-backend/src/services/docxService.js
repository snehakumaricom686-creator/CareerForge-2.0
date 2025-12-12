const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    Table,
    TableRow,
    TableCell,
    WidthType
} = require('docx');

/**
 * DOCX Service for generating Word documents from resume data
 */
class DocxService {
    /**
     * Generate DOCX from resume data
     * @param {Object} resume - Resume document
     * @returns {Promise<Buffer>} - DOCX buffer
     */
    async generateResumeDocx(resume) {
        const children = [];

        // Header - Name
        if (resume.personalInfo?.fullName) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: resume.personalInfo.fullName,
                            bold: true,
                            size: 48
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 }
                })
            );
        }

        // Contact Info
        const contactItems = [];
        if (resume.personalInfo?.email) contactItems.push(resume.personalInfo.email);
        if (resume.personalInfo?.phone) contactItems.push(resume.personalInfo.phone);
        if (resume.personalInfo?.address) contactItems.push(resume.personalInfo.address);

        if (contactItems.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: contactItems.join(' | '),
                            size: 20
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 }
                })
            );
        }

        // Links
        const links = [];
        if (resume.personalInfo?.linkedIn) links.push(`LinkedIn: ${resume.personalInfo.linkedIn}`);
        if (resume.personalInfo?.portfolio) links.push(`Portfolio: ${resume.personalInfo.portfolio}`);
        if (resume.personalInfo?.github) links.push(`GitHub: ${resume.personalInfo.github}`);

        if (links.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: links.join(' | '),
                            size: 18,
                            color: '0066CC'
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 }
                })
            );
        }

        // Summary
        if (resume.personalInfo?.summary) {
            children.push(this.createSectionHeader('PROFESSIONAL SUMMARY'));
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: resume.personalInfo.summary,
                            size: 22
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
        }

        // Experience
        if (resume.experience && resume.experience.length > 0) {
            children.push(this.createSectionHeader('WORK EXPERIENCE'));
            resume.experience.forEach(exp => {
                children.push(...this.createExperienceEntry(exp));
            });
        }

        // Education
        if (resume.education && resume.education.length > 0) {
            children.push(this.createSectionHeader('EDUCATION'));
            resume.education.forEach(edu => {
                children.push(...this.createEducationEntry(edu));
            });
        }

        // Skills
        if (resume.skills && resume.skills.length > 0) {
            children.push(this.createSectionHeader('SKILLS'));
            const skillsText = resume.skills.map(s => `${s.name} (${s.level})`).join(' • ');
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: skillsText,
                            size: 22
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
        }

        // Projects
        if (resume.projects && resume.projects.length > 0) {
            children.push(this.createSectionHeader('PROJECTS'));
            resume.projects.forEach(project => {
                children.push(...this.createProjectEntry(project));
            });
        }

        // Certifications
        if (resume.certifications && resume.certifications.length > 0) {
            children.push(this.createSectionHeader('CERTIFICATIONS'));
            resume.certifications.forEach(cert => {
                children.push(...this.createCertificationEntry(cert));
            });
        }

        // Languages
        if (resume.languages && resume.languages.length > 0) {
            children.push(this.createSectionHeader('LANGUAGES'));
            const langsText = resume.languages.map(l => `${l.name} (${l.proficiency})`).join(' • ');
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: langsText,
                            size: 22
                        })
                    ]
                })
            );
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        });

        return await Packer.toBuffer(doc);
    }

    /**
     * Create section header
     */
    createSectionHeader(title) {
        return new Paragraph({
            children: [
                new TextRun({
                    text: title,
                    bold: true,
                    size: 26,
                    color: '333333'
                })
            ],
            border: {
                bottom: {
                    color: '333333',
                    size: 6,
                    style: BorderStyle.SINGLE
                }
            },
            spacing: { before: 300, after: 150 }
        });
    }

    /**
     * Create experience entry
     */
    createExperienceEntry(exp) {
        const entries = [];

        entries.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: exp.position,
                        bold: true,
                        size: 24
                    }),
                    new TextRun({
                        text: ` at ${exp.company}`,
                        size: 24
                    })
                ]
            })
        );

        const dateRange = this.formatDateRange(exp.startDate, exp.endDate, exp.current);
        entries.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${exp.location ? exp.location + ' | ' : ''}${dateRange}`,
                        size: 20,
                        color: '666666',
                        italics: true
                    })
                ]
            })
        );

        if (exp.description) {
            entries.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: exp.description,
                            size: 22
                        })
                    ],
                    spacing: { before: 50 }
                })
            );
        }

        if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach(achievement => {
                entries.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `• ${achievement}`,
                                size: 22
                            })
                        ],
                        indent: { left: 360 }
                    })
                );
            });
        }

        entries.push(new Paragraph({ spacing: { after: 150 } }));
        return entries;
    }

    /**
     * Create education entry
     */
    createEducationEntry(edu) {
        const entries = [];

        entries.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: edu.institution,
                        bold: true,
                        size: 24
                    })
                ]
            })
        );

        entries.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
                        size: 22
                    })
                ]
            })
        );

        const dateRange = this.formatDateRange(edu.startDate, edu.endDate);
        let subtext = dateRange;
        if (edu.grade) subtext += ` | Grade: ${edu.grade}`;

        entries.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: subtext,
                        size: 20,
                        color: '666666',
                        italics: true
                    })
                ],
                spacing: { after: 150 }
            })
        );

        return entries;
    }

    /**
     * Create project entry
     */
    createProjectEntry(project) {
        const entries = [];

        entries.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: project.name,
                        bold: true,
                        size: 24
                    })
                ]
            })
        );

        if (project.technologies && project.technologies.length > 0) {
            entries.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Technologies: ${project.technologies.join(', ')}`,
                            size: 20,
                            color: '666666'
                        })
                    ]
                })
            );
        }

        if (project.description) {
            entries.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: project.description,
                            size: 22
                        })
                    ]
                })
            );
        }

        entries.push(new Paragraph({ spacing: { after: 150 } }));
        return entries;
    }

    /**
     * Create certification entry
     */
    createCertificationEntry(cert) {
        const entries = [];

        entries.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: cert.name,
                        bold: true,
                        size: 22
                    }),
                    new TextRun({
                        text: cert.issuer ? ` - ${cert.issuer}` : '',
                        size: 22
                    })
                ]
            })
        );

        if (cert.date) {
            const date = new Date(cert.date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            });
            entries.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: date,
                            size: 20,
                            color: '666666'
                        })
                    ],
                    spacing: { after: 100 }
                })
            );
        }

        return entries;
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

module.exports = new DocxService();
