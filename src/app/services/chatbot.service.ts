import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ChatAction {
  label: string;
  route?: string;
  url?: string;
  query?: string;
  type: 'route' | 'link' | 'query' | 'email';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  actions?: ChatAction[];
  suggestions?: string[];
  isUnknown?: boolean;
  needsUserEmail?: boolean;
  userQuery?: string;
  fromEmail?: string;
  emailStatus?: 'pending' | 'sending' | 'sent' | 'error';
  emailSent?: boolean;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  keywords: string[];
  phrases: string[];
  summary: string;
  details: string;
  route?: string;
  category: 'about' | 'service' | 'solution' | 'contact' | 'industry' | 'careers' | 'general';
  actions?: ChatAction[];
  suggestions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private readonly STORAGE_KEY = 'techxle_chatbot_history';

  private knowledgeBase: KnowledgeItem[] = [
    {
      id: 'about-techxle',
      title: 'About Techxle',
      keywords: ['about', 'company', 'techxle', 'techxl', 'who', 'what', 'overview', 'mission', 'vision', 'choose'],
      phrases: ['who are you', 'what is techxle', 'about the company', 'tell me about techxle', 'about us', 'what do you do'],
      summary: 'Techxle is a global technology and consulting firm driving business transformation through innovative digital solutions.',
      details: `**Techxle** empowers organizations to seamlessly reinvent themselves by accelerating digital innovation.

**Our Core Focus:**
- **Our Vision:** We envision a future where organizations seamlessly reinvent themselves through next-generation technologies and data convergence.
- **Our Mission:** Empower businesses with cutting-edge tools and services that drive operational efficiency, enhance productivity, and foster sustainable growth.
- **Why Choose Us:** Deep domain expertise in open-source collaboration tools, research informatics, enterprise systems, and end-to-end program delivery with seasoned leaders.
- **Philosophy:** *"Belief Drives Innovation"* — client-centered, associate-focused, and collaborative-minded.`,
      route: '/about-us',
      category: 'about',
      actions: [
        { label: 'Read About Us', route: '/about-us', type: 'route' },
        { label: 'Explore Solutions', route: '/solutions', type: 'route' },
        { label: 'Get in Touch', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['What services do you offer?', 'Where are your offices?', 'Tell me about LabAx LIMS']
    },
    {
      id: 'contact-info',
      title: 'Contact Information & Offices',
      keywords: ['contact', 'office', 'address', 'email', 'phone', 'call', 'location', 'reach', 'usa', 'india', 'dover', 'coimbatore', 'headquarters'],
      phrases: ['how to contact', 'where are you located', 'phone number', 'email address', 'office address', 'contact us', 'headquarters'],
      summary: 'Techxle has offices in Dover, Delaware (USA) and Coimbatore, Tamil Nadu (India).',
      details: `You can reach out to **Techxle** across our global locations:

📍 **USA - Headquarters:**
- **Address:** 8 The Green Ste R, Dover, DE 19901
- **Phone:** [302-265-3616](tel:3022653616)
- **Email:** [contact@techxl.org](mailto:contact@techxl.org)

📍 **India - Offshore Development Center (Techxle Consulting Services Pvt Ltd):**
- **Address:** G33, Regus, Saravanampatti Rd, Coimbatore, Tamil Nadu 641049, India
- **Phone:** [+91 91502 22922](tel:+919150222922)
- **D-U-N-S:** 73-784-9886

🌐 **Connect Online:**
- **LinkedIn:** [Techxle on LinkedIn](https://www.linkedin.com/company/techxl-llc/)
- **Careers:** contact@techxl.org`,
      route: '/contact-us',
      category: 'contact',
      actions: [
        { label: 'Go to Contact Page', route: '/contact-us', type: 'route' },
        { label: 'Call USA (+1 302-265-3616)', url: 'tel:3022653616', type: 'link' },
        { label: 'Call India (+91 91502 22922)', url: 'tel:+919150222922', type: 'link' },
        { label: 'Send Email', url: 'mailto:contact@techxl.org', type: 'link' }
      ],
      suggestions: ['Book a consultation', 'What services do you provide?', 'View office locations on map']
    },
    {
      id: 'services-overview',
      title: 'All Services Overview',
      keywords: ['services', 'offerings', 'capabilities', 'what do you do', 'develop', 'consulting'],
      phrases: ['what services do you offer', 'list of services', 'our services', 'all services', 'services list'],
      summary: 'Techxle delivers end-to-end digital solutions spanning AI, Cloud, Power Platform, Full Stack, UI/UX, Staffing, and DevOps.',
      details: `Techxle provides specialized, modern technology and engineering services:

1. **AI Application:** Custom machine learning, LLM integrations, computer vision & predictive intelligence.
2. **Power Platform Solution:** Low-code workflow automation, Power Apps, Power Automate, and Power BI dashboards.
3. **Cloud App Development:** Scalable cloud-native architectures, microservices, AWS/Azure/GCP cloud migration.
4. **Staffing Service:** Highly vetted software engineering talent aligned with your culture & technical stack.
5. **Full Stack Development:** Front-end and back-end web & mobile engineering with optimal performance.
6. **UI/UX Designing:** Human-centered, intuitive user interfaces and interactive prototypes.
7. **DevOps:** CI/CD pipelines, Docker, Kubernetes, infrastructure-as-code, and 24/7 reliability.`,
      route: '/services',
      category: 'service',
      actions: [
        { label: 'View All Services', route: '/services', type: 'route' },
        { label: 'AI Applications', route: '/services/ai-application', type: 'route' },
        { label: 'Schedule Consultation', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Tell me about AI Application', 'Power Platform Solutions', 'Full Stack Development', 'DevOps Services']
    },
    {
      id: 'service-ai',
      title: 'AI Application Development',
      keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'tensorflow', 'llm', 'deep learning', 'nlp', 'generative ai', 'models'],
      phrases: ['ai application', 'ai services', 'artificial intelligence solutions', 'machine learning development', 'do you do ai'],
      summary: 'Custom AI and Machine Learning systems designed to automate workflows and elevate decision intelligence.',
      details: `**AI Application Services:**
We build tailored AI-driven solutions that enhance business operations, automate processes, and improve customer engagement using advanced frameworks like TensorFlow, PyTorch, and modern LLM architectures.

**Key Highlights:**
- Custom predictive modeling & analytics
- Natural Language Processing (NLP) & conversational assistants
- Intelligent document processing and computer vision
- Agentic AI workflows that plan, reason, and take action
- Seamless integration with enterprise databases & ERP systems`,
      route: '/services/ai-application',
      category: 'service',
      actions: [
        { label: 'Explore AI Application', route: '/services/ai-application', type: 'route' },
        { label: 'See Agentic RAG Solution', route: '/solutions/agentic-rag', type: 'route' },
        { label: 'Talk to an AI Specialist', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['What is Agentic RAG?', 'Cloud App Development', 'How to schedule a demo?']
    },
    {
      id: 'service-power-platform',
      title: 'Power Platform Solutions',
      keywords: ['power', 'platform', 'powerapps', 'power apps', 'automate', 'flow', 'power bi', 'low code', 'microsoft'],
      phrases: ['power platform', 'power apps', 'power automate', 'microsoft power platform', 'low code development'],
      summary: 'Tailored low-code solutions on Microsoft Power Platform to optimize workflows and boost enterprise productivity.',
      details: `**Microsoft Power Platform Solutions:**
Our certified team leverages low-code tools to eliminate manual bottlenecks, streamline complex operations, and empower business users.

**Capabilities:**
- **Power Apps:** Custom mobile and web business applications built in rapid cycles.
- **Power Automate:** End-to-end multi-step workflow automation across disparate systems.
- **Power BI:** High-impact executive dashboards and operational analytics.
- **Dataverse & Connectors:** Secure integration with Microsoft 365, SharePoint, SAP, and custom APIs.`,
      route: '/services/power-platform-solution',
      category: 'service',
      actions: [
        { label: 'Learn More', route: '/services/power-platform-solution', type: 'route' },
        { label: 'Discuss Your Workflow', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Full Stack Development', 'Cloud App Development', 'ERP Solutions']
    },
    {
      id: 'service-cloud',
      title: 'Cloud App Development',
      keywords: ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'serverless', 'microservices', 'cloud migration'],
      phrases: ['cloud app development', 'cloud services', 'cloud migration', 'aws development', 'azure solutions'],
      summary: 'Concept-to-deployment cloud applications designed for resilience, infinite scale, and high security.',
      details: `**Cloud Application Development:**
From conceptualization to continuous deployment, our cloud solutions help businesses thrive in modern multi-cloud and hybrid ecosystems.

**Offerings:**
- Cloud-native architecture design using microservices and containers
- Cloud migration & legacy modernization (AWS, Azure, Google Cloud)
- Serverless architectures for cost-efficient scalability
- Robust API development and multi-tenant SaaS platforms
- Compliance-ready security and data governance`,
      route: '/services/cloud-app-development',
      category: 'service',
      actions: [
        { label: 'Explore Cloud Development', route: '/services/cloud-app-development', type: 'route' },
        { label: 'Contact Cloud Architects', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['DevOps Services', 'Full Stack Development', 'AI Applications']
    },
    {
      id: 'service-staffing',
      title: 'Staffing Services',
      keywords: ['staffing', 'hire', 'resource', 'talent', 'developers', 'contract', 'recruit', 'consultants', 'engineers'],
      phrases: ['staffing service', 'hire developers', 'it staffing', 'need developers', 'technical recruiting', 'contract staff'],
      summary: 'High-caliber tech talent matched with your technical requirements, team culture, and business milestones.',
      details: `**Staffing & Talent Solutions:**
Techxle provides specialized technical talent and augmented engineering squads that hit the ground running.

**Why Techxle Staffing?**
- Rigorously vetted developers, architects, UI/UX designers, and QA engineers
- Cultural alignment and domain expertise in healthcare, finance, life sciences, and cloud
- Flexible engagement models: dedicated teams, staff augmentation, or project-based
- Rapid onboarding with transparent communication and delivery tracking`,
      route: '/services/staffing-service',
      category: 'service',
      actions: [
        { label: 'Staffing Details', route: '/services/staffing-service', type: 'route' },
        { label: 'Request Talent Profile', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Full Stack Development', 'About Techxle', 'Contact Us']
    },
    {
      id: 'service-fullstack',
      title: 'Full Stack Development',
      keywords: ['full stack', 'fullstack', 'frontend', 'backend', 'angular', 'react', 'node', 'python', 'java', 'web application'],
      phrases: ['full stack development', 'web development', 'custom software development', 'software engineering'],
      summary: 'Seamless front-end and robust back-end engineering ensuring optimal performance and intuitive user journeys.',
      details: `**Full Stack Development Services:**
We build reliable, high-performing software systems that scale smoothly under enterprise workloads.

**Technology Expertise:**
- **Front-End:** Angular, React, TypeScript, HTML5/CSS3, responsive PWAs
- **Back-End:** Node.js, Express, Python (FastAPI/Django), Java, .NET Core
- **Databases:** PostgreSQL, MySQL, MongoDB, Redis, Microsoft SQL Server
- **Architecture:** Clean Architecture, RESTful APIs, GraphQL, Event-driven systems`,
      route: '/services/full-stack-development',
      category: 'service',
      actions: [
        { label: 'View Full Stack Services', route: '/services/full-stack-development', type: 'route' },
        { label: 'Start a Project', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['UI/UX Designing', 'Cloud App Development', 'DevOps']
    },
    {
      id: 'service-uiux',
      title: 'UI/UX Designing',
      keywords: ['ui', 'ux', 'design', 'user interface', 'user experience', 'figma', 'prototype', 'wireframe'],
      phrases: ['ui ux design', 'ui/ux designing', 'design services', 'user experience design', 'interface design'],
      summary: 'Intuitive, visually engaging, and human-centric design that maximizes user engagement and conversion.',
      details: `**UI/UX Design Services:**
We craft beautiful, accessible, and user-friendly digital products that combine aesthetic excellence with functional clarity.

**Design Methodology:**
- Comprehensive user research & persona mapping
- Information architecture & user journey mapping
- Wireframing & rapid interactive prototyping (Figma)
- Design Systems & component library development
- Usability testing & accessibility (WCAG) compliance`,
      route: '/services/ui-ux-designing',
      category: 'service',
      actions: [
        { label: 'Explore UI/UX', route: '/services/ui-ux-designing', type: 'route' },
        { label: 'Review Our Portfolio', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Full Stack Development', 'AI Applications', 'Explore Solutions']
    },
    {
      id: 'service-devops',
      title: 'DevOps & Cloud Operations',
      keywords: ['devops', 'ci cd', 'cicd', 'pipeline', 'docker', 'kubernetes', 'k8s', 'terraform', 'infrastructure', 'monitoring'],
      phrases: ['devops services', 'devops solutions', 'ci cd pipeline', 'cloud deployment', 'kubernetes consulting'],
      summary: 'Streamlining development and operations to achieve faster, continuous, and highly reliable software delivery.',
      details: `**DevOps Engineering:**
We bridge development and operations to eliminate deployment friction and maximize system uptime.

**Key Capabilities:**
- Automated CI/CD pipeline setup (GitHub Actions, GitLab, Azure DevOps)
- Containerization & orchestration with Docker and Kubernetes
- Infrastructure as Code (IaC) using Terraform & Ansible
- Automated security testing (DevSecOps) & vulnerability scanning
- Centralized logging, alerting, and observability (Prometheus, Grafana, Datadog)`,
      route: '/services/devops',
      category: 'service',
      actions: [
        { label: 'Explore DevOps', route: '/services/devops', type: 'route' },
        { label: 'Talk to a DevOps Engineer', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Cloud App Development', 'Full Stack Development', 'Contact Us']
    },
    {
      id: 'solution-labax-lims',
      title: 'LabAx LIMS (Laboratory Information Management System)',
      keywords: ['labax', 'lims', 'laboratory', 'lab', 'samples', 'instruments', 'compliance', 'pharma', '21 cfr', 'iso 17025'],
      phrases: ['what is labax lims', 'labax lims', 'lims solution', 'laboratory information management', 'lab software'],
      summary: 'Intelligent next-generation LIMS for modern laboratories to digitize workflows and eliminate manual errors.',
      details: `**LabAx LIMS:**
LabAx is Techxle's intelligent Laboratory Information Management System built for modern laboratories seeking operational excellence and measurable ROI.

**Key Features:**
- **Automated Sample Tracking:** Complete barcode/RFID chain of custody from reception to disposal.
- **Instrument Integration:** Direct data ingestion from analytical lab instruments (HPLC, GC-MS, PCR).
- **Compliance & Audit Trails:** Fully compliant with 21 CFR Part 11, GAMP 5, and ISO 17025.
- **Real-Time Visibility:** Live dashboards for sample turnaround time (TAT), workload, and reagent inventory.
- **Ideal For:** Pharmaceuticals, Healthcare, Biotech, Industrial R&D, Food & Beverage, and Energy testing labs.`,
      route: '/solutions/labax-lims',
      category: 'solution',
      actions: [
        { label: 'View LabAx LIMS Page', route: '/solutions/labax-lims', type: 'route' },
        { label: 'Watch Video Demo', route: '/lims', type: 'route' },
        { label: 'Request a Live Demo', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Watch LIMS Video Demo', 'Sample Tracking Solution', 'Lab Automation & Reservation']
    },
    {
      id: 'solution-erp',
      title: 'ERP Solutions (UAE-Compliant & Global)',
      keywords: ['erp', 'enterprise resource planning', 'uae', 'vat', 'accounting', 'supply chain', 'inventory', 'finance'],
      phrases: ['erp solutions', 'uae erp', 'tell me about erp', 'enterprise erp', 'vat compliant erp', 'erp software'],
      summary: 'Flexible, modular, UAE-compliant ERP platform built for SMEs and large enterprises.',
      details: `**Techxle ERP Solutions:**
Our flexible, UAE-compliant ERP platform adapts to your business across industries, sizes, and growth stages.

**Key Capabilities:**
- **UAE Regulatory & VAT Compliance:** Built-in FTA tax reporting, e-invoicing, and local compliance.
- **Financial & Accounting Management:** Multi-currency ledgers, accounts payable/receivable, and cash-flow forecasting.
- **Supply Chain & Inventory:** Real-time stock movement, procurement workflows, and vendor performance.
- **HR & Payroll (WPS):** Employee records, attendance, leave, and UAE Wages Protection System integration.
- **AI-Powered Insights:** Embedded predictive analytics to spot bottlenecks and forecast demand.`,
      route: '/solutions/erp-solutions',
      category: 'solution',
      actions: [
        { label: 'Explore ERP Solutions', route: '/solutions/erp-solutions', type: 'route' },
        { label: 'Watch ERP Video Demo', route: '/erp', type: 'route' },
        { label: 'Request ERP Consultation', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Watch ERP Demo', 'Agentic RAG Solution', 'Custom Sales CRM Platform']
    },
    {
      id: 'solution-rag',
      title: 'Agentic RAG (Retrieval-Augmented Generation with Autonomous Agents)',
      keywords: ['rag', 'agentic rag', 'retrieval augmented generation', 'autonomous agents', 'llm', 'enterprise ai', 'knowledge automation'],
      phrases: ['what is agentic rag', 'agentic rag', 'rag system', 'intelligent knowledge automation', 'autonomous ai agents'],
      summary: 'Advanced AI architecture combining LLMs, enterprise knowledge retrieval, and autonomous agents to plan, validate, and execute tasks.',
      details: `**Agentic RAG Solution:**
Unlike traditional chatbots or static search systems, **Agentic RAG** combines Large Language Models with autonomous intelligent agents that plan, retrieve, validate, and execute tasks across enterprise systems.

**Key Advantages:**
- **Autonomous Reasoning & Planning:** Breaks down complex business queries into logical execution steps.
- **Trusted Fact-Grounded Answers:** Eliminates hallucinations through verified multi-source enterprise retrieval.
- **Cross-System Action Execution:** Safely connects with ERP, CRM, EHR, and document repositories.
- **Regulated Industry Ready:** Ideal for Healthcare, Banking, Compliance, and Government where auditability is paramount.`,
      route: '/solutions/agentic-rag',
      category: 'solution',
      actions: [
        { label: 'Explore Agentic RAG', route: '/solutions/agentic-rag', type: 'route' },
        { label: 'Watch Agentic RAG Demo', route: '/agent', type: 'route' },
        { label: 'Talk to AI Team', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Watch Agentic RAG Demo', 'AI Application Services', 'LabAx LIMS']
    },
    {
      id: 'solutions-overview',
      title: 'All Specialized Solutions',
      keywords: ['solutions', 'products', 'platforms', 'offerings', 'software solutions'],
      phrases: ['what solutions do you have', 'all solutions', 'list of solutions', 'solutions list'],
      summary: '13+ specialized platforms including LabAx LIMS, ERP Solutions, Agentic RAG, Healthcare Portals, and Lab Automation.',
      details: `Techxle offers deep domain solutions across research, healthcare, and enterprise operations:

🧪 **Laboratory & Research Informatics:**
- **LabAx LIMS:** Next-gen Laboratory Information Management System
- **Lab Automation & Reservation:** Instrument scheduling & resource utilization
- **Sample Tracking:** Specimen custody, temperature logging & tracking
- **Acquisition Support for Labs:** Equipment procurement & supplier workflows

🏢 **Enterprise & Operations:**
- **ERP Solutions:** Modular, UAE VAT compliant enterprise resource planning
- **Agentic RAG:** Autonomous knowledge search & workflow execution
- **Project Portfolio Management (PPM):** Governance, budgets & milestones
- **Review Board Management:** Expedited ethics & IRB committee reviews
- **Custom Sales CRM Platform:** High-converting sales pipeline & lead tracking

🏥 **Healthcare & Public Sector:**
- **Healthcare Portal:** HIPAA-compliant patient/doctor engagement
- **Grant Applications:** Research grant authoring, budget & submission tracking
- **PSR (Product Safety & Regulatory):** Quality compliance & risk assessments`,
      route: '/solutions',
      category: 'solution',
      actions: [
        { label: 'View All Solutions', route: '/solutions', type: 'route' },
        { label: 'LabAx LIMS', route: '/solutions/labax-lims', type: 'route' },
        { label: 'ERP Solutions', route: '/solutions/erp-solutions', type: 'route' },
        { label: 'Agentic RAG', route: '/solutions/agentic-rag', type: 'route' }
      ],
      suggestions: ['Tell me about LabAx LIMS', 'Tell me about ERP Solutions', 'Healthcare Portal']
    },
    {
      id: 'solution-sample-tracking',
      title: 'Sample Tracking Solution',
      keywords: ['sample tracking', 'specimen', 'biobank', 'barcode', 'chain of custody', 'freezer'],
      phrases: ['sample tracking', 'how do you track samples', 'sample tracking software'],
      summary: 'Complete chain of custody tracking for biological and chemical samples.',
      details: `**Sample Tracking Solution:**
Comprehensive sample lifecycle management that guarantees integrity from collection to disposal.

**Features:**
- 2D/1D barcode and RFID tagging
- Location mapping down to freezer shelf, rack, and well
- Automated freeze-thaw count and audit logging
- Integration with clinical protocols and research studies`,
      route: '/solutions/sample-tracking',
      category: 'solution',
      actions: [
        { label: 'View Sample Tracking', route: '/solutions/sample-tracking', type: 'route' },
        { label: 'Explore LabAx LIMS', route: '/solutions/labax-lims', type: 'route' }
      ],
      suggestions: ['LabAx LIMS', 'Lab Automation & Reservation', 'Contact Us']
    },
    {
      id: 'solution-healthcare-portal',
      title: 'Healthcare Portal Solution',
      keywords: ['healthcare', 'portal', 'patient', 'doctor', 'clinic', 'hospital', 'telehealth', 'hipaa', 'ehr'],
      phrases: ['healthcare portal', 'patient portal', 'healthcare solutions', 'medical software'],
      summary: 'Secure, HIPAA-compliant patient and provider portal connecting clinical workflows and patient care.',
      details: `**Healthcare Portal Platform:**
Designed specifically for healthcare networks, specialty clinics, and medical researchers.

**Capabilities:**
- HIPAA and GDPR compliant architecture
- Telehealth appointments and secure doctor-patient messaging
- EHR/EMR data exchange via FHIR/HL7 standards
- Digital consent forms, lab result delivery, and prescription refills`,
      route: '/solutions/healthcare-portal',
      category: 'solution',
      actions: [
        { label: 'Healthcare Portal Details', route: '/solutions/healthcare-portal', type: 'route' },
        { label: 'Schedule a Healthcare Demo', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Industries Served', 'Agentic RAG', 'Contact Techxle']
    },
    {
      id: 'industries-served',
      title: 'Industries Served',
      keywords: ['industry', 'industries', 'healthcare', 'pharma', 'biotech', 'life sciences', 'sectors', 'clients'],
      phrases: ['what industries do you serve', 'industries', 'who do you work with', 'domains', 'sectors'],
      summary: 'Healthcare & Life Sciences are at our core, with solutions extending to Biotech, Enterprise, and Government.',
      details: `**Industries Techxle Serves:**

🏥 **Healthcare & Life Sciences (Our Core):**
Clinical operations, hospital networks, research institutes, diagnostics labs, and medical technology companies.

🧬 **Biotech & Research Organizations:**
High-throughput research laboratories, genomic labs, and contract research organizations (CROs).

🔬 **Clinical & Laboratory Operations:**
Analytical chemistry, environmental, food & beverage testing, and pharmaceutical QA/QC laboratories.

🏢 **Enterprise, SMEs & Public Sector:**
UAE & global enterprises seeking intelligent ERP, automated workflows, custom CRM, and secure knowledge retrieval.`,
      route: '/',
      category: 'industry',
      actions: [
        { label: 'Explore Case Studies', route: '/', type: 'route' },
        { label: 'Contact Industry Experts', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Healthcare Portal', 'LabAx LIMS', 'ERP Solutions']
    },
    {
      id: 'video-demos',
      title: 'Video Demonstrations',
      keywords: ['demo', 'video', 'watch', 'preview', 'lims demo', 'erp demo', 'rag demo'],
      phrases: ['video demo', 'watch demo', 'show me a demo', 'see video', 'video player'],
      summary: 'Interactive video walkthroughs for Agentic RAG, ERP Solutions, and LabAx LIMS.',
      details: `You can watch high-definition video walkthroughs of our flagship products right on the website:

1. 🤖 **Agentic RAG Demo:** See how autonomous AI agents retrieve enterprise knowledge and execute tasks.
2. 📊 **ERP Solutions Demo:** Explore modular financial, supply chain, and UAE VAT compliance workflows.
3. 🧪 **LabAx LIMS Demo:** Watch sample tracking, instrument integration, and regulatory compliance in action.`,
      category: 'general',
      actions: [
        { label: 'Watch Agentic RAG Demo', route: '/agent', type: 'route' },
        { label: 'Watch ERP Demo', route: '/erp', type: 'route' },
        { label: 'Watch LabAx LIMS Demo', route: '/lims', type: 'route' }
      ],
      suggestions: ['What is Agentic RAG?', 'Tell me about LabAx LIMS', 'Schedule a live consultation']
    },
    {
      id: 'careers-hiring',
      title: 'Careers & Working with Techxle',
      keywords: ['career', 'careers', 'job', 'jobs', 'hiring', 'work with us', 'apply', 'openings', 'resume'],
      phrases: ['are you hiring', 'career opportunities', 'work with us', 'jobs at techxle', 'how to apply'],
      summary: 'Join our team of technology innovators and research pioneers.',
      details: `**Careers at Techxle:**
We are constantly looking for talented software engineers, AI/ML specialists, cloud architects, UI/UX designers, and domain consultants to join our global team.

**How to Apply:**
- Send your resume and portfolio to **[contact@techxl.org](mailto:contact@techxl.org)** with the subject line *"Career Opportunity: [Your Role]"*.
- Connect with our recruiting team on LinkedIn: [Techxle LinkedIn Profile](https://www.linkedin.com/company/techxl-llc/)
- We offer collaborative culture, cutting-edge projects in healthcare and AI, and global growth opportunities!`,
      category: 'careers',
      actions: [
        { label: 'Send Resume (Email)', url: 'mailto:contact@techxl.org', type: 'link' },
        { label: 'Visit LinkedIn', url: 'https://www.linkedin.com/company/techxl-llc/', type: 'link' },
        { label: 'Contact Us', route: '/contact-us', type: 'route' }
      ],
      suggestions: ['Where are your offices?', 'About Techxle', 'What services do you offer?']
    }
  ];

  constructor() {}

  /**
   * Process a user's question and generate a smart, contextual answer based on website knowledge.
   */
  public askQuestion(query: string): Observable<ChatMessage> {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) {
      return of(this.getGreetingMessage()).pipe(delay(200));
    }

    const matchedResponse = this.findBestAnswer(cleanQuery);
    return of(matchedResponse).pipe(delay(350));
  }

  /**
   * Returns the initial welcoming message with high-value starter suggestions.
   */
  public getGreetingMessage(): ChatMessage {
    return {
      id: 'welcome-msg',
      sender: 'bot',
      text: `👋 Hello! Welcome to **Techxle**. 

I am your AI assistant, ready to answer questions about our **services**, **flagship solutions** (like LabAx LIMS, ERP Solutions, and Agentic RAG), **company mission**, **office locations**, or help you get in touch with our team.

How can I help you today?`,
      timestamp: new Date(),
      actions: [
        { label: 'Explore Services', route: '/services', type: 'route' },
        { label: 'Explore Solutions', route: '/solutions', type: 'route' },
        { label: 'Contact Us', route: '/contact-us', type: 'route' }
      ],
      suggestions: [
        'What services do you offer?',
        'Tell me about LabAx LIMS',
        'What is Agentic RAG?',
        'Where are your offices?',
        'How can I get a consultation?'
      ]
    };
  }

  /**
   * Evaluates query against knowledge items using multi-tiered semantic & keyword scoring,
   * with natural ChatGPT-like conversational intelligence for greetings, small talk, and identity.
   */
  private findBestAnswer(query: string): ChatMessage {
    const qLower = query.toLowerCase().trim();

    // 1. ChatGPT-like "How are you?" & status check
    if (/^(how\s+are\s+you|how\s+are\s+you\s+doing|how('?s|\s+is)\s+it\s+going|how('?s|\s+is)\s+everything|how\s+do\s+you\s+do|what'?s\s+up|sup\b|how\s+have\s+you\s+been)\b/i.test(qLower)) {
      return {
        id: this.generateId(),
        sender: 'bot',
        text: `I'm doing great, thank you for asking! 😊 

As Techxle's AI assistant, I'm always ready to help. How are you doing today? Let me know what you'd like to explore about our digital services or enterprise solutions!`,
        timestamp: new Date(),
        userQuery: query,
        isUnknown: false,
        suggestions: [
          'I am doing great!',
          'What services do you offer?',
          'Tell me about LabAx LIMS',
          'Where are your offices?'
        ]
      };
    }

    // 2. ChatGPT-like User feelings / "I'm good", "doing well", "fine"
    if (/^(i'?m\s+(good|fine|doing\s+well|great|awesome|doing\s+good|alright|ok|okay)|doing\s+(well|good|great)|fine\s+thank(s|\s+you)|all\s+good|very\s+well)\b/i.test(qLower)) {
      return {
        id: this.generateId(),
        sender: 'bot',
        text: `Glad to hear that! 😊 

How can I assist you with Techxle today? Feel free to ask about our software engineering services, flagship solutions (like LabAx LIMS, UAE ERP, and Agentic RAG), or scheduling a consultation.`,
        timestamp: new Date(),
        userQuery: query,
        isUnknown: false,
        suggestions: [
          'What services do you offer?',
          'Tell me about Agentic RAG',
          'Where are your offices?'
        ]
      };
    }

    // 3. ChatGPT-like Greetings ("hi", "hello", "hey", "good morning", etc.)
    if (/^(hi|hello|hey|heyy+|hiya|greetings|good\s*(morning|afternoon|evening|day)|hola|namaste|bonjour)\b/i.test(qLower)) {
      return {
        id: this.generateId(),
        sender: 'bot',
        text: `Hello there! 👋 It's wonderful to connect with you. 

I'm Techxle's AI Assistant. How can I help you today? You can ask me about our **engineering services**, specialized platforms like **LabAx LIMS** and **Agentic RAG**, our offices, or how we can help your business innovate.`,
        timestamp: new Date(),
        userQuery: query,
        isUnknown: false,
        suggestions: [
          'How are you?',
          'What services do you offer?',
          'Tell me about LabAx LIMS',
          'Where are your offices?'
        ]
      };
    }

    // 4. Identity & Name ("Who are you?", "What is your name?", "Are you ChatGPT?")
    if (/(who\s+are\s+you|what\s+is\s+your\s+name|what('?s|\s+is)\s+your\s+name|what\s+are\s+you|are\s+you\s+a\s+bot|are\s+you\s+(ai|an\s+ai|real|human)|are\s+you\s+chatgpt|tell\s+me\s+about\s+yourself)/i.test(qLower)) {
      return {
        id: this.generateId(),
        sender: 'bot',
        text: `I'm **Techxle AI Assistant**! 🤖 

Think of me as your virtual guide to Techxle. I was built by the engineering and AI team at Techxle to answer your questions about our technology services, specialized platforms (like LabAx LIMS, ERP, and Agentic RAG), and connect you with our specialists.

What would you like to know more about?`,
        timestamp: new Date(),
        userQuery: query,
        isUnknown: false,
        suggestions: [
          'What can you do?',
          'What services do you offer?',
          'Tell me about Techxle'
        ]
      };
    }

    // 5. Capabilities ("What can you do?", "How can you help?")
    if (/(what\s+can\s+you\s+do|how\s+can\s+you\s+help|what\s+do\s+you\s+do|help\s+me|what\s+can\s+i\s+ask)/i.test(qLower)) {
      return {
        id: this.generateId(),
        sender: 'bot',
        text: `I can help you with a wide range of topics across Techxle:

- 🤖 **AI & Cloud Engineering:** Machine learning, Agentic RAG, cloud migration (AWS, Azure, GCP), and DevOps CI/CD.
- 🧪 **Life Sciences & Laboratory Informatics:** LabAx LIMS, sample tracking, and 21 CFR Part 11 compliance.
- 🏢 **Enterprise Platforms:** UAE VAT-compliant ERP and Microsoft Power Platform workflows.
- 📍 **Offices & Global Reach:** Our Dover, Delaware (USA) HQ and Coimbatore (India) offshore center.
- ✉️ **Direct Support:** If you have a specific requirement I don't know, I can send it directly to our team!

What would you like to explore?`,
        timestamp: new Date(),
        userQuery: query,
        isUnknown: false,
        suggestions: [
          'What services do you offer?',
          'Tell me about LabAx LIMS',
          'Where are your offices?'
        ]
      };
    }

    // 6. Thank you
    if (/^(thanks|thank\s+you|thx|thank\s+you\s+so\s+much|appreciate\s+it|many\s+thanks)\b/i.test(qLower)) {
      return {
        id: this.generateId(),
        sender: 'bot',
        text: `You're very welcome! 😊 Always happy to assist. 

If you have any more questions about our services or would like to schedule a consultation with our team, feel free to ask anytime. Have a fantastic day! 🚀`,
        timestamp: new Date(),
        userQuery: query,
        isUnknown: false,
        actions: [
          { label: 'Explore Services', route: '/services', type: 'route' },
          { label: 'Contact Techxle', route: '/contact-us', type: 'route' }
        ],
        suggestions: [
          'What services do you offer?',
          'Where are your offices?'
        ]
      };
    }

    // 7. Goodbye
    if (/^(bye|goodbye|see\s+you|cya|take\s+care|have\s+a\s+nice\s+day|talk\s+to\s+you\s+later)\b/i.test(qLower)) {
      return {
        id: this.generateId(),
        sender: 'bot',
        text: `Goodbye! 👋 Thank you for chatting with me. Have a wonderful day ahead, and feel free to return whenever you need assistance!`,
        timestamp: new Date(),
        userQuery: query,
        isUnknown: false
      };
    }

    // 8. Acknowledgments ("ok", "okay", "cool", "nice", "got it")
    if (/^(ok|okay|alright|got\s+it|sure|cool|nice|understood|perfect|awesome)\b/i.test(qLower)) {
      return {
        id: this.generateId(),
        sender: 'bot',
        text: `Awesome! 👍 Let me know if you have any questions or if you'd like to explore any of our solutions.`,
        timestamp: new Date(),
        userQuery: query,
        isUnknown: false,
        suggestions: [
          'What services do you offer?',
          'Tell me about LabAx LIMS',
          'Contact Techxle'
        ]
      };
    }

    // Common stop-words that must NOT trigger keyword matches on their own
    const stopWords = new Set([
      'what', 'who', 'how', 'when', 'where', 'why', 'can', 'you', 'your', 'have',
      'does', 'with', 'about', 'tell', 'give', 'some', 'this', 'that', 'from',
      'they', 'them', 'their', 'there', 'please', 'know', 'want', 'need', 'like',
      'help', 'more', 'much', 'many', 'good', 'would', 'could', 'should', 'the',
      'and', 'for', 'are', 'was', 'were', 'been', 'being', 'shall', 'will'
    ]);

    const qWords = qLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // 9. Score all knowledge items
    let bestItem: KnowledgeItem | null = null;
    let highestScore = 0;

    for (const item of this.knowledgeBase) {
      let score = 0;

      // Exact phrase match (very high weight)
      for (const phrase of item.phrases) {
        if (qLower.includes(phrase.toLowerCase())) {
          score += 40;
        }
      }

      // Keyword matches (skip stop-words)
      for (const kw of item.keywords) {
        const kwLower = kw.toLowerCase();
        if (stopWords.has(kwLower)) continue;

        if (qLower.includes(kwLower)) {
          score += 10;
        }
        for (const word of qWords) {
          if (word === kwLower) {
            score += 15;
          } else if (word.startsWith(kwLower) || kwLower.startsWith(word)) {
            score += 5;
          }
        }
      }

      // Title word matches
      const titleWords = item.title.toLowerCase().split(/\s+/).filter(w => !stopWords.has(w));
      for (const tw of titleWords) {
        if (tw.length > 3 && qLower.includes(tw)) {
          score += 12;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestItem = item;
      }
    }

    // 10. Threshold check: if score is sufficient, return match
    if (bestItem && highestScore >= 20) {
      return {
        id: this.generateId(),
        sender: 'bot',
        text: `${bestItem.details}`,
        timestamp: new Date(),
        userQuery: query,
        isUnknown: false,
        actions: bestItem.actions,
        suggestions: bestItem.suggestions || [
          'Explore All Services',
          'Explore All Solutions',
          'Contact Techxle'
        ]
      };
    }

    // 11. Query is a MAJOR UNANSWERED QUESTION:
    // Ask the user for their "from mail" so we can forward their question to sampletesting.567123@gmail.com
    const targetEmail = 'sampletesting.567123@gmail.com';
    return {
      id: this.generateId(),
      sender: 'bot',
      text: `I don't have the exact answer for your question:
**"${query}"**

I'd be glad to forward this directly to our technical team at **${targetEmail}**. 

Please enter your email address below so our experts can review your question and respond back to you directly:`,
      timestamp: new Date(),
      userQuery: query,
      isUnknown: true,
      needsUserEmail: true,
      actions: [
        { label: 'View All Services', route: '/services', type: 'route' },
        { label: 'View All Solutions', route: '/solutions', type: 'route' },
        { label: 'Contact Us', route: '/contact-us', type: 'route' }
      ],
      suggestions: [
        'What services do you offer?',
        'Tell me about LabAx LIMS',
        'Where are your offices?'
      ]
    };
  }

  private generateId(): string {
    return 'msg-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
  }

  public getQuickSuggestions(): string[] {
    return [
      'What services do you offer?',
      'Tell me about LabAx LIMS',
      'What is Agentic RAG?',
      'ERP Solutions for UAE',
      'Where are your offices?',
      'How to contact or schedule a call?'
    ];
  }
}
