const mongoose = require('mongoose');
const PageContent = require('../models/PageContent');
require('dotenv').config();

async function createManufacturingPage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await PageContent.findOne({ slug: 'manufacturing' });
    
    if (existing) {
      console.log('Manufacturing page already exists, updating...');
      existing.title = 'Manufacturing';
      existing.description = 'Our manufacturing capabilities and processes';
      existing.sections = [
        {
          sectionId: 'hero',
          type: 'hero',
          title: 'Manufacturing Excellence',
          subtitle: 'State-of-the-Art Facilities & Processes',
          description: 'Our ISO-certified manufacturing facility is equipped with modern machinery and skilled craftsmen to deliver precision-engineered products.',
          link: '/contact',
          linkText: 'Request Quote',
          secondaryLink: '/projects',
          secondaryLinkText: 'View Projects',
          bgColor: 'gradient',
          order: 0,
          isVisible: true
        },
        {
          sectionId: 'capabilities',
          type: 'features',
          title: 'Our Capabilities',
          subtitle: 'Comprehensive manufacturing solutions with cutting-edge technology and skilled craftsmanship',
          items: [
            { 
              title: 'Steel Fabrication', 
              description: 'Custom steel fabrication with precision cutting and welding for industrial and commercial applications' 
            },
            { 
              title: 'Laser Cutting', 
              description: 'Advanced laser cutting technology for precise sheet metal and pipe cutting with minimal waste' 
            },
            { 
              title: 'Powder Coating', 
              description: 'High-quality powder coating for durable, long-lasting finishes on metal products' 
            },
            { 
              title: 'MS Fabrication', 
              description: 'Mild steel fabrication for structural components and industrial equipment' 
            },
            { 
              title: 'CNC Machining', 
              description: 'Computer-controlled machining for precision parts and components' 
            },
            { 
              title: 'Custom Welding', 
              description: 'Expert welding services including MIG, TIG, and arc welding' 
            }
          ],
          bgColor: 'light',
          order: 1,
          isVisible: true
        },
        {
          sectionId: 'process',
          type: 'list',
          title: 'Our Process',
          subtitle: 'From concept to completion, we ensure quality at every step',
          items: [
            { 
              title: 'Design & Engineering', 
              description: 'Our team works with you to understand requirements and create detailed technical drawings' 
            },
            { 
              title: 'Material Selection', 
              description: 'We source high-quality materials that meet your specifications and industry standards' 
            },
            { 
              title: 'Precision Fabrication', 
              description: 'Using state-of-the-art equipment, we fabricate components with tight tolerances' 
            },
            { 
              title: 'Quality Control', 
              description: 'Every product undergoes rigorous inspection before delivery' 
            }
          ],
          bgColor: 'white',
          order: 2,
          isVisible: true
        },
        {
          sectionId: 'equipment',
          type: 'content',
          title: 'Our Equipment',
          description: 'We invest in the latest manufacturing technology to deliver superior results',
          content: 'Our facility is equipped with state-of-the-art machinery including CNC laser cutting systems, automated welding stations, powder coating booths, and precision measuring equipment. This investment in technology allows us to maintain high quality standards while ensuring efficient production times.',
          bgColor: 'white',
          order: 3,
          isVisible: true
        },
        {
          sectionId: 'quality',
          type: 'features',
          title: 'Quality Assurance',
          subtitle: 'Committed to delivering excellence in every project',
          items: [
            { 
              title: 'ISO 9001:2015 Certified', 
              description: 'Our quality management system meets international standards' 
            },
            { 
              title: 'Rigorous Testing', 
              description: 'Every product undergoes comprehensive quality checks' 
            },
            { 
              title: 'Skilled Workforce', 
              description: 'Our team consists of experienced engineers and technicians' 
            },
            { 
              title: 'Continuous Improvement', 
              description: 'We constantly upgrade our processes and technology' 
            }
          ],
          bgColor: 'light',
          order: 4,
          isVisible: true
        },
        {
          sectionId: 'cta',
          type: 'cta',
          title: 'Ready to Start Your Project?',
          description: 'Contact us today to discuss your manufacturing requirements and get a free quote',
          link: '/contact',
          linkText: 'Get in Touch',
          bgColor: 'gradient',
          order: 5,
          isVisible: true
        }
      ];
      await existing.save();
      console.log('Manufacturing page updated successfully');
    } else {
      const manufacturingPage = await PageContent.create({
        slug: 'manufacturing',
        title: 'Manufacturing',
        description: 'Our manufacturing capabilities and processes',
        isPublished: true,
        sections: [
          {
            sectionId: 'hero',
            type: 'hero',
            title: 'Manufacturing Excellence',
            subtitle: 'State-of-the-Art Facilities & Processes',
            description: 'Our ISO-certified manufacturing facility is equipped with modern machinery and skilled craftsmen to deliver precision-engineered products.',
            link: '/contact',
            linkText: 'Request Quote',
            secondaryLink: '/projects',
            secondaryLinkText: 'View Projects',
            bgColor: 'gradient',
            order: 0,
            isVisible: true
          },
          {
            sectionId: 'capabilities',
            type: 'features',
            title: 'Our Capabilities',
            subtitle: 'Comprehensive manufacturing solutions with cutting-edge technology and skilled craftsmanship',
            items: [
              { 
                title: 'Steel Fabrication', 
                description: 'Custom steel fabrication with precision cutting and welding for industrial and commercial applications' 
              },
              { 
                title: 'Laser Cutting', 
                description: 'Advanced laser cutting technology for precise sheet metal and pipe cutting with minimal waste' 
              },
              { 
                title: 'Powder Coating', 
                description: 'High-quality powder coating for durable, long-lasting finishes on metal products' 
              },
              { 
                title: 'MS Fabrication', 
                description: 'Mild steel fabrication for structural components and industrial equipment' 
              },
              { 
                title: 'CNC Machining', 
                description: 'Computer-controlled machining for precision parts and components' 
              },
              { 
                title: 'Custom Welding', 
                description: 'Expert welding services including MIG, TIG, and arc welding' 
              }
            ],
            bgColor: 'light',
            order: 1,
            isVisible: true
          },
          {
            sectionId: 'process',
            type: 'list',
            title: 'Our Process',
            subtitle: 'From concept to completion, we ensure quality at every step',
            items: [
              { 
                title: 'Design & Engineering', 
                description: 'Our team works with you to understand requirements and create detailed technical drawings' 
              },
              { 
                title: 'Material Selection', 
                description: 'We source high-quality materials that meet your specifications and industry standards' 
              },
              { 
                title: 'Precision Fabrication', 
                description: 'Using state-of-the-art equipment, we fabricate components with tight tolerances' 
              },
              { 
                title: 'Quality Control', 
                description: 'Every product undergoes rigorous inspection before delivery' 
              }
            ],
            bgColor: 'white',
            order: 2,
            isVisible: true
          },
          {
            sectionId: 'equipment',
            type: 'content',
            title: 'Our Equipment',
            description: 'We invest in the latest manufacturing technology to deliver superior results',
            content: 'Our facility is equipped with state-of-the-art machinery including CNC laser cutting systems, automated welding stations, powder coating booths, and precision measuring equipment. This investment in technology allows us to maintain high quality standards while ensuring efficient production times.',
            bgColor: 'white',
            order: 3,
            isVisible: true
          },
          {
            sectionId: 'quality',
            type: 'features',
            title: 'Quality Assurance',
            subtitle: 'Committed to delivering excellence in every project',
            items: [
              { 
                title: 'ISO 9001:2015 Certified', 
                description: 'Our quality management system meets international standards' 
              },
              { 
                title: 'Rigorous Testing', 
                description: 'Every product undergoes comprehensive quality checks' 
              },
              { 
                title: 'Skilled Workforce', 
                description: 'Our team consists of experienced engineers and technicians' 
              },
              { 
                title: 'Continuous Improvement', 
                description: 'We constantly upgrade our processes and technology' 
              }
            ],
            bgColor: 'light',
            order: 4,
            isVisible: true
          },
          {
            sectionId: 'cta',
            type: 'cta',
            title: 'Ready to Start Your Project?',
            description: 'Contact us today to discuss your manufacturing requirements and get a free quote',
            link: '/contact',
            linkText: 'Get in Touch',
            bgColor: 'gradient',
            order: 5,
            isVisible: true
          }
        ]
      });
      console.log('Manufacturing page created successfully');
    }

  } catch (error) {
    console.error('Error creating manufacturing page:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createManufacturingPage();
