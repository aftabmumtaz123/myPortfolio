import { StrictMode, useEffect, useMemo, useState, type PointerEvent } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, ArrowLeft, Check, Database, Globe, Layers3, LockKeyhole, Menu, MoveUpRight,
  Play, Quote, Server, X, Zap, GitBranch, MousePointer2, Mail, Linkedin, Github,
  ExternalLink, Sparkles, ShieldCheck, Gauge, MessageSquare, Code2, Rocket, Search,
  ChevronDown, ChevronUp, Users as UsersIcon
} from 'lucide-react';
import {
  SiReact, SiTypescript, SiNextdotjs, SiTailwindcss, SiNodedotjs, SiExpress,
  SiMongodb, SiPostgresql, SiSocketdotio, SiCloudinary, SiVercel, SiRailway, SiPrisma, SiJavascript, SiHtml5, SiCss, SiFigma, SiPython, SiPhp, SiGit, SiGithub, SiDocker
} from 'react-icons/si';
import './styles.css';
import { submitLead, getProjects, getServices, getTechnologies, getTeam, getSettings, getProjectBySlug } from './api';

const fallbackServices = [
  ['Custom Web Apps','Business-ready web applications built around your workflows, users and goals.',Layers3,'Web platforms, dashboards, portals and internal tools.'],
  ['SaaS Development','From focused MVPs to scalable products, dashboards and core experiences.',Zap,'Product architecture, subscriptions, auth and operational dashboards.'],
  ['Backend & APIs','Reliable Node.js APIs, authentication, databases, integrations and real-time systems.',Server,'REST APIs, integrations, real-time features and secure business logic.'],
  ['Data & Architecture','MongoDB and PostgreSQL architecture designed for maintainability and growth.',Database,'Data models, migrations, performance and scalable service boundaries.']
] as const;


const serviceVisuals = [
  {
    key: 'web',
    label: 'BUSINESS PLATFORM',
    Icon: Globe,
    render: () => <div className="serviceVisual serviceVisualWeb"><div className="browserDots"><i/><i/><i/></div><div className="browserLayout"><span/><span/><span/><span/><span/></div><div className="browserChart"><i/><i/><i/><i/><i/></div></div>
  },
  {
    key: 'saas',
    label: 'PRODUCT DASHBOARD',
    Icon: Gauge,
    render: () => <div className="serviceVisual serviceVisualSaaS"><div className="saasTop"><b>PRODUCT</b><span>● LIVE</span></div><div className="saasMetrics"><i/><i/><i/></div><div className="saasGraph"><i/><i/><i/><i/><i/><i/></div></div>
  },
  {
    key: 'api',
    label: 'API / NETWORK',
    Icon: Server,
    render: () => <div className="serviceVisual serviceVisualApi"><div className="apiNode n1">GET</div><div className="apiNode n2">API</div><div className="apiNode n3">DB</div><div className="apiNode n4">200</div><span className="apiLine l1"/><span className="apiLine l2"/><span className="apiLine l3"/></div>
  },
  {
    key: 'data',
    label: 'DATA ARCHITECTURE',
    Icon: Database,
    render: () => <div className="serviceVisual serviceVisualData"><div className="dbStack"><i/><i/><i/></div><div className="dbLines"><span/><span/><span/></div><div className="dbStatus">● CONNECTED</div></div>
  }
] as const;

function getServiceVisual(title:string){
  const t=title.toLowerCase();
  if(t.includes('saas')) return serviceVisuals[1];
  if(t.includes('backend') || t.includes('api')) return serviceVisuals[2];
  if(t.includes('data') || t.includes('architecture')) return serviceVisuals[3];
  return serviceVisuals[0];
}

const fallbackProjects = [
  {title:'CoupleNest',tag:'SaaS / Web App',text:'A relationship platform with real-time messaging, moments, notifications and partner-focused features.',tech:'React · TypeScript · Node · MongoDB · Socket.IO',tone:'blue',metrics:['Real-time messaging','PWA + notifications','Partner connection'],description:'A full-stack product focused on private communication, shared memories and real-time interaction.'},
  {title:'QR Studio',tag:'SaaS Platform',text:'A QR generation and management experience designed for businesses.',tech:'React · Node · PostgreSQL',tone:'cyan',metrics:['QR management','Analytics-ready','Admin workflows'],description:'A business-oriented QR platform designed around creation, management and future analytics.'},
  {title:'Accessories Loop',tag:'E-commerce',text:'A commerce experience for mobile accessories with product and admin workflows.',tech:'EJS · Express · MongoDB',tone:'slate',metrics:['Product catalog','Admin workflow','Commerce UX'],description:'An e-commerce experience for mobile accessories with a practical backend and management flow.'}
];

const fallbackTechGroups = [
  ['Frontend',['React','TypeScript','Next.js','Tailwind CSS']],
  ['Backend',['Node.js','Express.js','REST APIs','Socket.IO']],
  ['Data',['MongoDB','PostgreSQL','Mongoose','Prisma']],
  ['Infrastructure',['Vercel','Railway','Oracle Cloud','Cloudinary']],
] as const;

const processSteps = [
  ['Discovery','Understand the business, users, constraints and success criteria.','We clarify the problem before choosing the technology.'],
  ['Planning','Turn requirements into a practical technical plan.','Scope, architecture, milestones and communication are agreed early.'],
  ['UI / UX','Shape a clear experience before development.','Important flows are made understandable before code gets expensive.'],
  ['Development','Build clean, maintainable and testable software.','Frontend, backend, database and integrations move together.'],
  ['Testing','Validate flows and production readiness.','We test important paths, edge cases and deployment behavior.'],
  ['Launch & Support','Deploy, monitor and keep improving.','The relationship can continue after the first release.']
];

const processExperience = [
  {title:'Discovery', kicker:'UNDERSTAND BEFORE WE BUILD.', body:'We understand the business, users, constraints and success criteria before choosing the technology.', deliverables:['Requirements','User flows','Technical direction'], nodes:['Business','Users','Requirements'], icon:Search},
  {title:'Planning', kicker:'TURN IDEAS INTO AN EXECUTABLE PLAN.', body:'Scope, architecture, milestones and communication are agreed early so the build has a clear direction.', deliverables:['Architecture','Database','API plan','Milestones'], nodes:['Architecture','Database','API','Milestones'], icon:Layers3},
  {title:'UI / UX', kicker:'MAKE THE EXPERIENCE CLEAR BEFORE CODE.', body:'Important flows are shaped into an understandable interface before development gets expensive.', deliverables:['Wireframes','Design','Prototype'], nodes:['Wireframe','Design','Prototype'], icon:MousePointer2},
  {title:'Development', kicker:'BUILD THE SYSTEM.', body:'Frontend, backend, database and integrations move together into clean, maintainable and testable software.', deliverables:['Frontend','Backend','Database','Integration'], nodes:['Frontend','API','Database','Services'], icon:Code2},
  {title:'Testing', kicker:'VALIDATE PRODUCTION READINESS.', body:'We test important paths, edge cases, security and deployment behavior before release.', deliverables:['Tests','Security','Performance','QA'], nodes:['Tests','Security','Performance','QA'], icon:ShieldCheck},
  {title:'Launch & Support', kicker:'DEPLOY, MONITOR, IMPROVE.', body:'The product moves into production with monitoring and a practical path for continued improvement.', deliverables:['Deploy','Monitor','Improve'], nodes:['Deploy','Monitor','Improve'], icon:Rocket}
];

const successStories = [
  ['CoupleNest','Real-time relationship SaaS','React · TypeScript · Node.js · MongoDB · Socket.IO'],
  ['QR Studio','QR management platform','React · Node.js · PostgreSQL'],
  ['Accessories Loop','E-commerce experience','EJS · Express.js · MongoDB'],
  ['LumaLink','Productivity / collaboration concept','React · Node.js · APIs']
];

const partnerStack = [
  ['React', SiReact], ['TypeScript', SiTypescript], ['Next.js', SiNextdotjs], ['Tailwind CSS', SiTailwindcss],
  ['Node.js', SiNodedotjs], ['Express.js', SiExpress], ['MongoDB', SiMongodb], ['PostgreSQL', SiPostgresql],
  ['Socket.IO', SiSocketdotio], ['Cloudinary', SiCloudinary], ['Vercel', SiVercel], ['Railway', SiRailway]
] as const;

const technologyIconMap: Record<string, any> = {
  'react': SiReact,
  'react.js': SiReact,
  'typescript': SiTypescript,
  'next.js': SiNextdotjs,
  'nextjs': SiNextdotjs,
  'tailwind css': SiTailwindcss,
  'tailwind': SiTailwindcss,
  'node.js': SiNodedotjs,
  'nodejs': SiNodedotjs,
  'express.js': SiExpress,
  'express': SiExpress,
  'mongodb': SiMongodb,
  'postgresql': SiPostgresql,
  'socket.io': SiSocketdotio,
  'cloudinary': SiCloudinary,
  'vercel': SiVercel,
  'railway': SiRailway,
  'prisma': SiPrisma,
  'javascript': SiJavascript,
  'js': SiJavascript,
  'html': SiHtml5,
  'html5': SiHtml5,
  'css': SiCss,
  'css3': SiCss,
  'figma': SiFigma,
  'python': SiPython,
  'php': SiPhp,
  'git': SiGit,
  'github': SiGithub,
  'docker': SiDocker,
};

function TechnologyIcon({name}:{name:string}){
  const Icon=technologyIconMap[name.trim().toLowerCase()] || Code2;
  return <Icon aria-hidden="true" focusable="false"/>;
}

const comparisonRows = [
  ['Product understanding','Discovery + technical planning','Execution only'],
  ['Architecture','Backend-first, maintainable foundation','Depends on engagement'],
  ['Communication','Direct founder / developer access','Multiple handoffs possible'],
  ['Delivery','Working milestones throughout','Final delivery focused'],
  ['Post-launch','Support and iteration available','Often separate engagement']
];

const faqs = [
  ['What kind of projects do you take?','DevStak focuses on web applications, SaaS products, backend systems, APIs, dashboards, e-commerce and custom business software.'],
  ['Can you work with an existing application?','Yes. Existing systems can be audited, fixed, extended, migrated or gradually modernized rather than rebuilt unnecessarily.'],
  ['Do you only work with Pakistani businesses?','No. The positioning is designed for both Pakistani businesses and international clients.'],
  ['Can you handle the backend as well as the UI?','Yes. Backend engineering, APIs, authentication, databases and architecture are a core part of the DevStak positioning.'],
];

function App(){
  const [menu,setMenu]=useState(false);
  const [modal,setModal]=useState(false);
  const [activeProject,setActiveProject]=useState<typeof projects[number] | null>(null);
  const [activeStep,setActiveStep]=useState(0);
  const [openFaq,setOpenFaq]=useState<number | null>(null);
  const [pointer,setPointer]=useState({x:0,y:0});
  const [sent,setSent]=useState(false);
  const [leadError,setLeadError]=useState('');
  const [sending,setSending]=useState(false);
  const [solutionsOpen,setSolutionsOpen]=useState(false);
  const [companyOpen,setCompanyOpen]=useState(false);
  const [engagement,setEngagement]=useState('MVP');
  const [services,setServices]=useState<any[]>(fallbackServices as any);
  const [projects,setProjects]=useState<any[]>(fallbackProjects as any);
  const [techGroups,setTechGroups]=useState<any[]>(fallbackTechGroups as any);
  const [siteSettings,setSiteSettings]=useState<Record<string,string>>({});

  const go=(id:string)=>{const routes:Record<string,string>={home:'/',services:'/services',work:'/projects',process:'/process',about:'/about',contact:'/contact'};const path=routes[id]||`/${id}`;window.location.href=path;setMenu(false)};
  const handlePointer=(e:PointerEvent<HTMLElement>)=>{const r=e.currentTarget.getBoundingClientRect();setPointer({x:((e.clientX-r.left)/r.width-.5)*2,y:((e.clientY-r.top)/r.height-.5)*2})};
  const resetPointer=()=>setPointer({x:0,y:0});

  useEffect(()=>{
    Promise.all([getServices(),getProjects(),getTechnologies(),getSettings()]).then(([serviceData,projectData,techData,settingsData])=>{
      if(serviceData.services?.length) setServices(serviceData.services.map((x:any)=>[x.title,x.description,Layers3,x.description]));
      if(projectData.projects?.length) setProjects(projectData.projects.map((x:any,i:number)=>({title:x.title,tag:x.type,text:x.shortDescription,tech:x.technologies?.map((t:any)=>t.technology.name).join(' · ')||'',tone:['blue','cyan','slate'][i%3],metrics:x.highlights||[],description:x.description,problem:x.problem,solution:x.solution,highlights:x.highlights||[],featured:!!x.featured,status:x.status,liveUrl:x.liveUrl,githubUrl:x.githubUrl,coverImage:x.coverImage,slug:x.slug})));
      if(settingsData.settings) setSiteSettings(settingsData.settings);
      if(techData.technologies?.length){const groups:any={};techData.technologies.forEach((x:any)=>{(groups[x.category]??=[]).push(x.name)});setTechGroups(Object.entries(groups).map(([k,v])=>[k,v]));}
    }).catch(()=>{});
  },[]);

  useEffect(()=>{
    const els=document.querySelectorAll('.reveal');
    const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1});
    els.forEach(e=>ob.observe(e));
    return()=>ob.disconnect();
  },[]);

  const year=useMemo(()=>new Date().getFullYear(),[]);
  const featuredProject=projects.find((p:any)=>p.featured) || projects[0] || fallbackProjects[0];
  const proofMetrics=[['Projects shipped',String(projects.length)],['Services',String(services.length)],['Technology areas',String(techGroups.length)],['Delivery stages',String(processSteps.length)]];
  const engagementOptions={
    'MVP':['Product planning','UI/UX','Backend architecture','API development','Deployment','Post-launch support'],
    'Business Website':['Discovery','Responsive UI','CMS / integrations','Analytics setup','Deployment','Maintenance'],
    'SaaS':['Product architecture','Authentication','Backend APIs','Database design','Admin dashboard','Deployment & support'],
    'Custom Software':['Requirements mapping','System architecture','Custom workflows','API / integrations','Deployment','Long-term support']
  } as Record<string,string[]>;

  return <div className="site">
    <header><nav className="nav container">
      <button className="logo" onClick={()=>go('home')}><span>DEV</span>STAK</button>
      <div className={'links '+(menu?'open':'')}>
        <div className="navDrop" onMouseEnter={()=>setSolutionsOpen(true)} onMouseLeave={()=>setSolutionsOpen(false)}>
          <button onClick={()=>go('services')}>Solutions <ChevronDown size={13}/></button>
          {solutionsOpen&&<div className="dropPanel">
            <div><small>BUILD</small><button onClick={()=>go('services')}><Layers3/><span><b>Custom Software</b><em>Web apps & business platforms</em></span></button><button onClick={()=>go('services')}><Zap/><span><b>SaaS Products</b><em>MVPs to scalable products</em></span></button></div>
            <div><small>ENGINEER</small><button onClick={()=>go('services')}><Server/><span><b>Backend & APIs</b><em>Reliable systems & integrations</em></span></button><button onClick={()=>go('process')}><Database/><span><b>Architecture</b><em>Data, security & scalability</em></span></button></div>
          </div>}
        </div>
        <button onClick={()=>go('work')}>Case Studies</button>
        <button onClick={()=>go('process')}>How We Work</button>
        <div className="navDrop" onMouseEnter={()=>setCompanyOpen(true)} onMouseLeave={()=>setCompanyOpen(false)}>
          <button onClick={()=>go('about')}>Company <ChevronDown size={13}/></button>
          {companyOpen&&<div className="dropPanel companyDrop"><div><small>DEVSTAK</small><button onClick={()=>go('about')}><Sparkles/><span><b>About</b><em>Founder & engineering approach</em></span></button><button onClick={()=>go('team')}><UsersIcon/><span><b>Team</b><em>Meet the people behind DevStak</em></span></button><button onClick={()=>go('contact')}><MessageSquare/><span><b>Contact</b><em>Start a conversation</em></span></button></div></div>}
        </div>
        <button onClick={()=>go('contact')}>Contact</button>
        <button className="mobileCta" onClick={()=>setModal(true)}>Start a Project <ArrowRight size={16}/></button>
      </div>
      <button className="navCta" onClick={()=>setModal(true)}>Start a Project <ArrowRight size={16}/></button>
      <button className="menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
    </nav></header>

    <main>
      <section id="home" className="hero" onPointerMove={handlePointer} onPointerLeave={resetPointer}>
        <div className="grid"/><div className="heroNoise"/><div className="orb orbA"/><div className="orb orbB"/><div className="orbit orbitA"/><div className="orbit orbitB"/>
        <div className="container heroIn">
          <div className="heroCopy">
            <div className="eyebrow"><i/> SOFTWARE DEVELOPMENT STUDIO</div>
            <h1>We build digital products<br/><em>that move businesses forward.</em></h1>
            <p>{siteSettings['brand.tagline'] || 'Product-minded software development for businesses that need reliable systems, clear communication and a team that can own the technical work.'}</p>
            <div className="actions"><button className="primary" onClick={()=>setModal(true)}>Start a Project <ArrowRight/></button><button className="secondary" onClick={()=>go('work')}><Play/> View Our Work</button></div>
            <div className="heroTrust"><span><Check/> Backend-first engineering</span><span><Check/> Production-ready architecture</span><span><Check/> Direct communication</span></div>
          </div>
          <div className="hero3d" style={{transform:`perspective(1100px) rotateX(${pointer.y*-3}deg) rotateY(${pointer.x*4}deg)`}}>
            <div className="heroGlow"/><div className="ring r1"/><div className="ring r2"/>
            <div className="cube">
              <div className="face front"><div className="cubeTop"><span className="live"/> DEVSTAK CORE</div><div className="cubeTitle">DIGITAL<br/><span>ENGINE</span></div><div className="bars">{[36,62,48,82,68,94].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div><div className="cubeMeta"><span>99.9% SYSTEM</span><span>● LIVE</span></div></div>
              <div className="face side"><div className="codeLines">{[72,86,58,79,42,68].map((w,i)=><i key={i} style={{width:`${w}%`}}/>)}</div></div>
              <div className="face top"><span>API</span><span>DB</span><span>UI</span></div>
            </div>
            <div className="floatCard api"><span className="mini"><GitBranch/></span><div><b>API</b><small>Operational</small></div><em>●</em></div>
            <div className="floatCard cloud"><span className="mini"><Globe/></span><div><b>Cloud</b><small>Production</small></div><em>●</em></div>
            <div className="floatCard database"><span className="mini"><Database/></span><div><b>Database</b><small>Synced</small></div><em>●</em></div>
            <div className="floatCard secure"><span className="mini"><LockKeyhole/></span><div><b>Security</b><small>Auth layer</small></div><em>●</em></div>
            <div className="floatCard analytics"><span className="mini"><Gauge/></span><div><b>Analytics</b><small>Live insights</small></div><em>↗</em></div>
            <div className="stageCaption"><MousePointer2/> Explore the system</div>
          </div>
        </div>
      </section>

      <div className="trust"><div className="container trustIn"><span>TRUSTED TECHNOLOGIES WE BUILD WITH</span>{['React','Node.js','Express','MongoDB','PostgreSQL','TypeScript','Vercel','AWS-ready'].map(x=><b key={x}>{x}</b>)}</div></div>

      <section className="section deliveryIntro"><div className="container centeredBlock"><small>DELIVER. RESEARCH. HANDOFFS. PRODUCT DEVELOPMENT.</small><h2>Product teams<br/><span>that deliver.</span></h2><p>Bring an idea, an existing system or a product that needs to move faster. DevStak combines product thinking with hands-on engineering.</p><button className="primary" onClick={()=>setModal(true)}>Talk to the team <ArrowRight/></button><div className="miniProductShowcase">{['CoupleNest','QR Studio','Accessories Loop'].map((x,i)=>{const project=projects[i]||fallbackProjects[i]; return <button key={x} className={'miniProduct m'+i} onClick={()=>project&&setActiveProject(project)}><small>{i===0?'REAL-TIME WEB APP':i===1?'SAAS PLATFORM':'E-COMMERCE'}</small><b>{project?.title||x}</b><span>{project?.tech||'Project details coming soon'}</span><i>{i===0?'● Live system':i===1?'Analytics ready':'Commerce flow'}</i></button>})}</div></div></section>

      <section className="section storiesSection"><div className="container centeredBlock"><small>PROOF FROM PRODUCTS WE BUILD</small><h2>Projects & <span>success stories.</span></h2><p>Use real work as proof. Each project below can become a deeper case study as DevStak grows.</p><div className="stackStrip" aria-label="DevStak technology stack">{partnerStack.map(([name,Icon])=><div className="stackLogo" key={name} title={name} aria-label={name}><Icon aria-hidden="true"/><span>{name}</span></div>)}</div><div className="storyGrid">{projects.slice(0,6).map((project:any)=><a className="storyCard reveal" href={`/projects/${project.slug||project.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}`} key={project.slug||project.title}>{project.coverImage?<img src={project.coverImage} alt={project.title} style={{width:64,height:64,objectFit:"cover",borderRadius:16}}/>:<div className="storyAvatar">{project.title.slice(0,2).toUpperCase()}</div>}<div><b>{project.title}</b><small>{project.tag}</small><span>{project.tech||project.text}</span></div><MoveUpRight/></a>)}{projects.length===0&&<p className="adminHint">No published projects yet.</p>}</div></div></section>

      <section className="section featuredCase"><div className="container"><div className="sectionLabel"><small>FEATURED PROJECT</small><span>01 / WORK</span></div><div className="featuredCaseGrid"><div className="featuredCaseCopy"><span className="caseKicker">{featuredProject.tag}</span><h2>{featuredProject.title}</h2><p>{featuredProject.text}</p><div className="caseTechPills">{String(featuredProject.tech||'').split(' · ').slice(0,5).map((x:string)=><span key={x}>{x}</span>)}</div><button className="primary" onClick={()=>setActiveProject(featuredProject)}>View case study <ArrowRight/></button></div><button className="featuredDashboard" onClick={()=>setActiveProject(featuredProject)} aria-label={`Open ${featuredProject.title} case study`}>{featuredProject.coverImage?<img src={featuredProject.coverImage} alt={featuredProject.title}/>:<div className="dashboardMock"><div className="dashboardTop"><span>{featuredProject.title} Dashboard</span><span>● SYSTEM ONLINE</span></div><div className="dashboardStats"><b>{featuredProject.title}<span>featured case study</span></b><b>{String(featuredProject.tech||'Full-stack').split(' · ')[0]}<span>primary stack</span></b></div><div className="dashboardChart">{[28,46,39,64,55,82,68,91,74].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div><div className="dashboardFooter"><span>API <em>Operational</em></span><span>Database <em>Operational</em></span><span>Cloud <em>Active</em></span></div></div>}</button></div></div></section>

      <section className="section valueSection"><div className="container splitEditorial"><div><small>PROBLEM → SOLUTION → RESULT</small><h2>Do it right<br/><span>the first time.</span></h2><div className="problemFlow"><article><span>01</span><b>Business problem</b><p>Manual workflows, unclear requirements or a product that needs to move faster.</p></article><article><span>02</span><b>DevStak solution</b><p>Clear architecture, focused product flows and software built around the real workflow.</p></article><article><span>03</span><b>Practical result</b><p>Better visibility, maintainable systems and a clear path for the next release.</p></article></div><button className="darkOutline" onClick={()=>go('process')}>See how we work <ArrowRight/></button></div><div className="editorialVisual caseVisual"><div className="visualPerson"><span>DEVSTAK / SYSTEM</span><b>PROBLEM<br/>SOLVED</b></div><div className="visualBadge"><Check/> Architecture first</div><div className="visualBadge second"><Check/> Working milestones</div></div></div></section>

      <section className="section dark softwareFeature"><div className="container softwareFeatureGrid"><div><small>SOFTWARE DEVELOPMENT</small><h2>Build the system<br/><span>behind the product.</span></h2><p>From backend APIs and databases to dashboards, authentication and real-time features, DevStak can own the engineering layer that keeps your product running.</p><div className="featurePills"><span>Backend APIs</span><span>Web Applications</span><span>Authentication</span><span>Real-time Systems</span></div><button className="primary" onClick={()=>setModal(true)}>Build with DevStak <ArrowRight/></button></div><button className="softwareMock" onClick={()=>setActiveProject(projects[0])}><div className="mockHeader"><span>DEVSTAK / PRODUCT</span><span>● LIVE</span></div><div className="mockBody"><div className="mockSidebar">{['Overview','Projects','Messages','Analytics'].map(x=><i key={x}>{x}</i>)}</div><div className="mockPanel"><b>Product dashboard</b><div className="mockGraph">{[30,54,42,72,58,82,65].map((h,i)=><i key={i} style={{height:h+'%'}}/>)}</div><div className="mockStats"><span>99.9% uptime</span><span>24 active flows</span></div></div></div></button></div></section>

      <section className="section subscription"><div className="container centeredBlock"><small>FLEXIBLE ENGINEERING SUPPORT</small><h2>Developer <span>subscription.</span></h2><p>A simple way to keep development moving when your product needs continuous technical work.</p><div className="subscriptionGrid"><article><b>Focused capacity</b><span>Backend, frontend, fixes, integrations and product improvements.</span></article><article><b>Clear priorities</b><span>Work is organized around a shared backlog and practical milestones.</span></article><article><b>Long-term support</b><span>Keep the same technical context as your product evolves.</span></article></div><button className="secondary darkText" onClick={()=>setModal(true)}>Discuss ongoing support <ArrowRight/></button></div></section>

      <section className="proofSection"><div className="container"><div className="proofHeader"><div><small>PROOF OVER PROMISES</small><h2>Real systems.<br/><span>Real engineering.</span></h2></div><p>These are live facts from the current DevStak portfolio and delivery model. As the business grows, this section can become a client-results dashboard.</p></div><div className="proofMetrics">{proofMetrics.map(([label,value])=><article key={label}><b>{value}</b><span>{label}</span></article>)}</div><div className="systemStatus"><span>● DEVSTAK SYSTEM MAP</span><span>API <b>Architecture</b></span><span>Database <b>Data layer</b></span><span>Cloud <b>Deployment</b></span><span>Security <b>Auth layer</b></span></div></div></section>

      <section id="services" className="section"><div className="container">
        <div className="head serviceHead"><div><small>DEVSTAK / SERVICES</small><h2>Software built around<br/><span>your business.</span></h2></div><p>From business applications and SaaS platforms to backend systems and data architecture, DevStak builds reliable software designed to grow with your business.</p></div>
        <div className="serviceGrid">{services.map(([title,text,Icon,detail],i)=>(()=>{const visual=getServiceVisual(String(title)); return <article className={`service serviceCard${i===2?' serviceCardActive':''} reveal`} key={title}><div className="serviceCardTop"><div className="icon"><Icon size={21}/></div><span className="serviceVisualLabel">{visual.label}</span></div><div className="serviceVisualWrap">{visual.render()}</div><h3>{title}</h3><p>{text}</p><small className="serviceDetail">{String(detail)}</small><div className="serviceMeta"><span>{i===0?'Best for: Business platforms':i===1?'Best for: Digital products':i===2?'Node.js · REST · Real-time':'MongoDB · PostgreSQL · Prisma'}</span><button onClick={()=>setModal(true)}>Explore service <ArrowRight/></button></div></article>})())}</div>
        <div className="serviceCta"><div><small>NEED SOMETHING MORE SPECIFIC?</small><p>Tell us what you're building and we'll help define the right technical approach.</p></div><button className="primary" onClick={()=>setModal(true)}>Start a Project <ArrowRight/></button></div>
      </div></section>

      <section id="work" className="section dark workShowcase"><div className="container">
        <div className="head light"><div><small>SELECTED CASE STUDIES</small><h2>Software we've designed,<br/><span>built and shipped.</span></h2></div><button className="textBtn" onClick={()=>setModal(true)}>Discuss your project <ArrowRight/></button></div>
        <div className="featuredCaseHome">
          <button className="featuredCaseVisual" onClick={()=>setActiveProject(featuredProject)} aria-label={`Open ${featuredProject.title} case study`}>
            {featuredProject.coverImage ? <img src={featuredProject.coverImage} alt={featuredProject.title}/> : <div className="featuredMock"><span>DEVSTAK / {featuredProject.title.toUpperCase()}</span><b>PRODUCT<br/>DASHBOARD</b><i>● SYSTEM ONLINE</i></div>}
            <span className="featuredCaseBadge">FEATURED CASE STUDY</span>
          </button>
          <div className="featuredCaseBody">
            <div className="caseEyebrow"><span>{featuredProject.tag||'Web Application'}</span><span>Selected work</span></div>
            <h3>{featuredProject.title}</h3>
            <p className="caseLead">{featuredProject.text}</p>
            <div className="caseMetaStrip"><div><small>TECHNOLOGY</small><b>{featuredProject.tech||'Full-stack engineering'}</b></div><div><small>TYPE</small><b>{featuredProject.tag||'Web Application'}</b></div><div><small>STATUS</small><b>{featuredProject.status==='PUBLISHED'?'Production / Published':'Case study in progress'}</b></div></div>
            <div className="caseOutcomeBlock"><small>WHAT WE BUILT</small><div className="caseOutcomeList">{(featuredProject.highlights?.length?featuredProject.highlights:['Product workflows','Backend architecture','Responsive user experience']).slice(0,5).map((x:string)=><span key={x}><Check/>{x}</span>)}</div></div>
            <div className="caseActionRow"><button className="caseBtn" onClick={()=>setActiveProject(featuredProject)}>View Case Study <ArrowRight/></button><span>Challenge → Solution → Result</span></div>
          </div>
        </div>
        {projects.filter((p:any)=>p.title!==featuredProject.title).length>0&&<div className="moreProjectsHome"><div className="moreProjectsHead"><div><small>MORE PROJECTS</small><h3>More <span>work.</span></h3></div><button className="textBtn" onClick={()=>go('work')}>View all case studies <ArrowRight/></button></div><div className="projectGrid projectGridCards">{projects.filter((p:any)=>p.title!==featuredProject.title).slice(0,4).map((project:any,i:number)=><article className="project projectLarge reveal visible" key={project.title}><button className={'visual v'+i} onClick={()=>setActiveProject(project)} aria-label={`Open ${project.title} case study`}>{project.coverImage?<img src={project.coverImage} alt={project.title}/>:<div className="visualFallback"><span>{project.title}</span><small>{project.tag}</small></div>}<span className="visualArrow"><ArrowRight/></span></button><div className="pInfo"><div><small>{project.tag}</small><h3>{project.title}</h3></div><p>{project.text}</p><div className="projectTags">{(project.tech||'').split(' · ').filter(Boolean).slice(0,5).map((m:string)=><span key={m}>{m}</span>)}</div><button className="caseBtn" onClick={()=>setActiveProject(project)}>Explore project <ArrowRight/></button></div></article>)}</div></div>}
      </div></section>

      <section className="section techSection"><div className="container">
        <div className="head"><div><small>TECHNOLOGY ECOSYSTEM</small><h2>The stack behind<br/><span>the product.</span></h2></div><p>Use the tools that fit the problem. The goal is dependable software, not technology for its own sake.</p></div>
        <div className="techGrid">{techGroups.map(([title,items])=><article className="techCard reveal" key={title}><div className="techIcon"><Code2/></div><h3>{title}</h3><div>{items.map(x=><span key={x}>{x}</span>)}</div></article>)}</div>
      </div></section>

      <section className="section waysSection"><div className="container">
        <div className="head"><div><small>WAYS TO WORK WITH DEVSTAK</small><h2>Choose the setup<br/><span>that fits the project.</span></h2></div><p>Whether you need a new product, an existing system improved or ongoing engineering support, the engagement can start small and evolve with the work.</p></div>
        <div className="waysGrid">
          <article className="wayCard reveal"><small>01 · BUILD</small><h3>Product Development</h3><p>From idea to launch: discovery, UI, backend, frontend, deployment and iteration.</p><button onClick={()=>setModal(true)}>Start a product <ArrowRight/></button></article>
          <article className="wayCard featured reveal"><small>02 · IMPROVE</small><h3>Existing System</h3><p>Audit, fix, modernize or extend an existing application without unnecessary rewrites.</p><button onClick={()=>setModal(true)}>Improve my system <ArrowRight/></button></article>
          <article className="wayCard reveal"><small>03 · SUPPORT</small><h3>Ongoing Engineering</h3><p>Keep a product moving with focused backend, API, feature and maintenance work.</p><button onClick={()=>setModal(true)}>Discuss support <ArrowRight/></button></article>
        </div>
      </div></section>

      <section className="section comparisonSection"><div className="container centeredBlock"><small>FIND THE RIGHT ENGAGEMENT</small><h2>What do you <span>need?</span></h2><p>Choose the project shape closest to yours and see the kind of work that can be included.</p><div className="engagementTabs">{Object.keys(engagementOptions).map(option=><button className={engagement===option?'active':''} key={option} onClick={()=>setEngagement(option)}>{option}</button>)}</div><div className="engagementResult"><div><small>RECOMMENDED ENGAGEMENT</small><h3>{engagement}</h3><p>Start with a focused scope and expand the engagement as the product proves itself.</p><button className="primary" onClick={()=>setModal(true)}>Talk about this project <ArrowRight/></button></div><div className="engagementList">{engagementOptions[engagement].map(x=><span key={x}><Check/>{x}</span>)}</div></div></div></section>

      <section className="section gettingStarted"><div className="container centeredBlock"><small>STARTING A PROJECT</small><h2>Getting <span>started.</span></h2><p>A simple path from the first conversation to a clear technical next step.</p><div className="startSteps"><article><b>01</b><h3>Free call assessment</h3><p>Tell us what you're trying to build and where the current system stands.</p></article><article><b>02</b><h3>Scope & solution design</h3><p>We turn the requirements into a practical scope, architecture and delivery path.</p></article><article><b>03</b><h3>Project kickoff</h3><p>Agree on milestones, communication and the first piece of working software.</p></article></div><button className="primary" onClick={()=>setModal(true)}>Start the conversation <ArrowRight/></button></div></section>

      <section id="process" className="section processSection"><div className="container">
        <div className="head"><div><small>OUR PROCESS</small><h2>Clear from idea<br/><span>to launch.</span></h2></div><p>No black boxes. You know what is happening, what is next and what you are getting at every stage.</p></div>
        <div className="processInteractive"><div className="processRail">{processSteps.map(([title],i)=><button className={activeStep===i?'active':''} key={title} onClick={()=>setActiveStep(i)}><b>0{i+1}</b><span>{title}</span></button>)}</div><div className="processDetail"><div className="stepNumber">0{activeStep+1}</div><Sparkles/><h3>{processSteps[activeStep][0]}</h3><p>{processSteps[activeStep][1]}</p><div className="detailNote"><Check/>{processSteps[activeStep][2]}</div><div className="processNav"><button disabled={activeStep===0} onClick={()=>setActiveStep(s=>Math.max(0,s-1))}>Previous</button><button disabled={activeStep===processSteps.length-1} onClick={()=>setActiveStep(s=>Math.min(processSteps.length-1,s+1))}>Next <ArrowRight/></button></div></div></div>
      </div></section>

      <section className="section difference"><div className="container"><div className="head"><div><small>THE DEVSTAK DIFFERENCE</small><h2>Built for businesses,<br/><span>not just briefs.</span></h2></div><p>The engineering approach stays close to the business problem, with backend ownership and production thinking built into the engagement.</p></div><div className="differenceGrid"><article><b>01</b><h3>Business-first</h3><p>Understand the problem before writing code.</p></article><article><b>02</b><h3>Backend-focused</h3><p>Reliable APIs, data models and architecture form the foundation.</p></article><article><b>03</b><h3>Production-ready</h3><p>Deployment, security and performance are part of the delivery conversation.</p></article><article><b>04</b><h3>Long-term support</h3><p>Keep technical context after launch and continue improving the product.</p></article></div></div></section>

      <section id="about" className="section about"><div className="container aboutGrid">
        <div className="aboutIdentity reveal"><div className="portrait"><span>AM</span><i/></div><small>MEET THE DEVELOPER BEHIND DEVSTAK</small><h2>Aftab Mumtaz,<br/><span>founder & developer.</span></h2><p className="role">Full-Stack Developer & Founder.</p></div>
        <div className="reveal"><p className="aboutLead">I help businesses turn ideas into scalable web applications, SaaS products and reliable backend systems. DevStak keeps the process practical: understand the problem, build the right system, communicate clearly and support the product after launch.</p><div className="checks"><div><Check/> Backend-first engineering</div><div><Check/> Transparent communication</div><div><Check/> Scalable architecture</div><div><Check/> Long-term support</div></div><div className="aboutStats"><div><b>Backend</b><span>Core specialty</span></div><div><b>MERN</b><span>Product stack</span></div><div><b>Remote</b><span>Client-ready</span></div></div></div>
      </div></section>

      <section className="section credentials"><div className="container"><div className="head"><div><small>TRUST & CREDENTIALS</small><h2>Professional,<br/><span>transparent, practical.</span></h2></div><p>Use genuine proof here as your client history grows. Until then, show the work, technologies and process clearly instead of inventing social proof.</p></div><div className="credentialGrid"><article className="credential reveal"><ShieldCheck/><h3>Engineering mindset</h3><p>Architecture, authentication, databases and maintainability are considered as part of the product.</p></article><article className="credential reveal"><Gauge/><h3>Performance-aware</h3><p>Projects are designed with practical performance, deployment and growth considerations.</p></article><article className="credential reveal"><MessageSquare/><h3>Direct collaboration</h3><p>Clear requirements, visible milestones and straightforward communication throughout the project.</p></article></div></div></section>

      <section className="quote"><div className="container"><Quote/><p>“The best software isn't the software with the most features. It's the software that makes the right business problem disappear.”</p><span>— DevStak engineering principle</span></div></section>

      <section className="section testimonials"><div className="container"><div className="head"><div><small>CLIENT PROOF</small><h2>What clients <span>say.</span></h2></div><p>Real testimonials will appear here as client engagements are completed. Until then, DevStak uses project evidence rather than invented social proof.</p></div><div className="testimonialPlaceholder"><Quote/><div><b>Client testimonials coming next.</b><p>When genuine feedback is available, this space becomes a high-visibility proof section with the client's name, role and company.</p></div></div></div></section>

      <section className="section faq"><div className="container"><div className="head"><div><small>FAQ</small><h2>Frequently asked<br/><span>questions.</span></h2></div><p>Short answers to the questions clients usually have before starting a software project.</p></div><div className="faqList">{faqs.map(([q,a],i)=><article className="faqItem reveal" key={q}><button onClick={()=>setOpenFaq(openFaq===i?null:i)}><span>{q}</span>{openFaq===i?<ChevronUp/>:<ChevronDown/>}</button>{openFaq===i&&<p>{a}</p>}</article>)}</div></div></section>

      <section id="contact" className="section finalCta"><div className="container finalCtaGrid"><div><small>LET'S BUILD TOGETHER</small><h2>Ready to scale your<br/><span>product?</span></h2><p>Bring the idea, the problem or the existing system. We'll help you identify the next practical step.</p><div className="finalBullets"><span><Check/> Clear scope</span><span><Check/> Direct communication</span><span><Check/> Technical ownership</span></div></div><button className="finalFormCard" onClick={()=>setModal(true)}><span>START A PROJECT</span><b>Tell us about your project</b><i><ArrowRight/></i><small>We'll get back to you with the next step.</small></button></div></section>
    </main>

    <footer><div className="container foot"><div className="footBrand"><button className="logo" onClick={()=>go('home')}><span>DEV</span>STAK</button><p>{siteSettings['brand.tagline'] || 'Web & software development for ambitious businesses.'}</p><div className="socials">{siteSettings['social.github']&&<a href={siteSettings['social.github']} target="_blank" rel="noreferrer" aria-label="GitHub"><Github/></a>}{siteSettings['social.linkedin']&&<a href={siteSettings['social.linkedin']} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin/></a>}{siteSettings['social.upwork']&&<a className="upworkLink" href={siteSettings['social.upwork']} target="_blank" rel="noreferrer" aria-label="Upwork">Upwork</a>}<a href={`mailto:${siteSettings['contact.email'] || 'hello@devstak.com'}`} aria-label="Email"><Mail/></a></div></div><div className="footNav"><small>EXPLORE</small><div className="footLinks"><button onClick={()=>go('services')}>Solutions</button><button onClick={()=>go('work')}>Case Studies</button><button onClick={()=>go('process')}>How We Work</button><button onClick={()=>go('about')}>Company</button><button onClick={()=>go('contact')}>Contact</button></div></div><div className="footMeta"><small>DEVSTAK / SOFTWARE STUDIO</small><span>© {year} DevStak. All rights reserved.</span></div></div></footer>

    {activeProject&&<div className="backdrop" onClick={()=>setActiveProject(null)}><div className="caseModal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setActiveProject(null)}><X/></button><small>{activeProject.tag}</small><h2>{activeProject.title}</h2><p>{activeProject.description}</p><div className="caseTech">{activeProject.tech.split(' · ').map(t=><span key={t}>{t}</span>)}</div><div className="caseFeatures">{activeProject.metrics.map(m=><div key={m}><Check/>{m}</div>)}</div><button className="primary" onClick={()=>{setActiveProject(null);setModal(true)}}>Discuss a similar project <ArrowRight/></button></div></div>}

    {modal&&<div className="backdrop" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setModal(false)}><X/></button>{sent?<div className="success"><div className="successIcon"><Check/></div><small>INQUIRY READY</small><h2>Thanks for reaching out.</h2><p>Your form is ready for the next integration step. Connect the submit handler to your email/CRM endpoint when you wire the production site.</p><button className="primary" onClick={()=>{setSent(false);setModal(false)}}>Close <ArrowRight/></button></div>:<><small>START A PROJECT</small><h2>Let's build something useful.</h2><p>Share a few details and we'll get the conversation started.</p><form className="form" onSubmit={async e=>{e.preventDefault();setLeadError('');setSending(true);const f=new FormData(e.currentTarget);try{await submitLead({name:String(f.get('name')),email:String(f.get('email')),company:String(f.get('company')||''),projectType:String(f.get('projectType')),budget:String(f.get('budget')||''),message:String(f.get('message'))});setSent(true)}catch(err){setLeadError(err instanceof Error?err.message:'Unable to send inquiry')}finally{setSending(false)}}}><input name="name" required placeholder="Your name"/><input name="email" required type="email" placeholder="Email address"/><input name="company" placeholder="Company"/><select name="projectType" defaultValue="" required><option value="" disabled>Project type</option><option>Web Application</option><option>SaaS</option><option>Backend / API</option><option>E-commerce</option><option>Existing System</option><option>Other</option></select><select name="budget" defaultValue=""><option value="" disabled>Approximate budget</option><option>$500 – $1,000</option><option>$1,000 – $2,500</option><option>$2,500 – $5,000</option><option>$5,000+</option><option>Not sure yet</option></select><textarea name="message" required placeholder="Tell us about your project, goals and current situation..."/>{leadError&&<div style={{color:'#c83b54',fontSize:12}}>{leadError}</div>}<button className="primary" disabled={sending} type="submit">{sending?'Sending…':'Send Inquiry'} <ArrowRight/></button></form></>}</div></div>}
  </div>
}


function PublicNav({active}:{active:string}){
  const links=[['services','Solutions'],['projects','Case Studies'],['process','How We Work'],['about','Company'],['team','Team'],['contact','Contact']] as const;
  return <div className="links open">{links.map(([key,label])=><a key={key} className={active===key?'active':''} href={`/${key}`}>{label}</a>)}<a className="mobileCta" href="/">Home <ArrowRight size={16}/></a></div>
}

function PublicPage({kind, slug}:{kind:string;slug?:string}){
  const [data,setData]=useState<any[]>([]);
  const [project,setProject]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [galleryIndex,setGalleryIndex]=useState<number|null>(null);
  const [activeProcessStep,setActiveProcessStep]=useState(0);
  useEffect(()=>{(async()=>{try{
    if(kind==='project'&&slug){const [x,all]=await Promise.all([getProjectBySlug(slug),getProjects()]);setProject(x.project);setData((all.projects||[]).filter((item:any)=>item.slug!==slug).slice(0,3))}
    else if(kind==='services'){const x=await getServices();setData(x.services||[])}
    else if(kind==='projects'){const x=await getProjects();setData(x.projects||[])}
    else if(kind==='process'){setData(processSteps)}
    else if(kind==='about'){const x=await getTeam();setData((x.team||[]).filter((m:any)=>m.featured!==false))}
    else if(kind==='team'){const x=await getTeam();setData(x.team||[])}
    else if(kind==='contact'){setData([])}
  }finally{setLoading(false)}})()},[kind,slug]);
  useEffect(()=>{
    if(kind!=='process') return;
    const blocks=Array.from(document.querySelectorAll<HTMLElement>('[data-process-step]'));
    if(!blocks.length) return;
    const observer=new IntersectionObserver((entries)=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible){setActiveProcessStep(Number((visible.target as HTMLElement).dataset.processStep||0));}
    },{rootMargin:'-30% 0px -55% 0px',threshold:[0,.2,.5,1]});
    blocks.forEach(block=>observer.observe(block));
    return()=>observer.disconnect();
  },[kind,data.length]);
  const title=kind==='services'?'Services':kind==='projects'?'Case Studies':kind==='process'?'How We Work':kind==='about'?'About DevStak':kind==='team'?'Our Team':kind==='contact'?'Contact DevStak':project?.title||'Project';
  const gallery=Array.from(new Set(((project?.galleryImages?.length?project.galleryImages:project?.coverImage?[project.coverImage]:[]) as string[]).filter(Boolean)));
  const ActiveProcessIcon=processExperience[activeProcessStep].icon;
  return <div className="site">
    <header><nav className="nav container"><a className="logo" href="/"><span>DEV</span>STAK</a><PublicNav active={kind==='project'?'projects':kind}/><a className="navCta" href="/contact">Start a Project <ArrowRight size={16}/></a></nav></header>
    <main>
      {loading ? <section className="projectLoading"><div className="container"><small>DEVSTAK / PROJECT</small><div className="projectSkeleton"/></div></section> : kind==='project'&&project ? <ProjectCaseStudy project={project} gallery={gallery} galleryIndex={galleryIndex} setGalleryIndex={setGalleryIndex} relatedProjects={data}/> :
      <section className={`section publicSection publicSection-${kind}`} style={{paddingTop:150}}>
        <div className="container">
          {kind!=='process'&&<small>DEVSTAK / {kind.toUpperCase()}</small>}
          {kind==='services' ? <>
            <div className="publicServiceHead">
              <div><h1>Software built around<br/><span>your business.</span></h1></div>
              <p>From business applications and SaaS platforms to backend systems and data architecture, DevStak builds reliable software designed to grow with your business.</p>
            </div>
            <div className="serviceGrid">
              {data.map((x:any,i:number)=>{const visual=getServiceVisual(String(x.title)); return <article className={`service serviceCard${i===2?' serviceCardActive':''} reveal visible`} key={x.id||x.title}>
                <div className="serviceCardTop"><div className="icon"><Layers3 size={21}/></div><span className="serviceVisualLabel">{visual.label}</span></div>
                <div className="serviceVisualWrap">{visual.render()}</div>
                <h3>{x.title}</h3>
                <p>{x.description}</p>
                <small className="serviceDetail">{x.title==='Custom Web Apps'?'React · Node.js · PostgreSQL':x.title==='SaaS Development'?'Product architecture · Auth · Dashboards':x.title==='Backend & APIs'?'Node.js · REST · Socket.IO':'MongoDB · PostgreSQL · Prisma'}</small>
                <div className="serviceMeta"><span>{x.title==='Custom Web Apps'?'Best for: Business platforms':x.title==='SaaS Development'?'Best for: Digital products':x.title==='Backend & APIs'?'Node.js · REST · Real-time':'MongoDB · PostgreSQL · Prisma'}</span><a href="/contact">Explore service <ArrowRight/></a></div>
              </article>})}
            </div>
            <div className="serviceCta"><div><small>NEED SOMETHING MORE SPECIFIC?</small><p>Tell us what you're building and we'll help define the right technical approach.</p></div><a className="primary" href="/contact">Start a Project <ArrowRight/></a></div>
          </> : <>
            {kind!=='projects'&&kind!=='process'&&<h1 style={{fontSize:'clamp(48px,8vw,92px)',margin:'14px 0 30px'}}>{title}</h1>}
            {kind==='projects'&&<ProjectsIndex projects={data}/>}
            {kind==='process'&&<>
              <div className="processPageIntro"><div><small>DEVSTAK / OUR PROCESS</small><h1>A structured path from idea to <span>production.</span></h1></div><p>From first conversation to launch, every stage has a clear purpose. We keep the process practical, visible and aligned with the product you're actually trying to build.</p></div>
              <div className="processExperience">
                <div className="processTimeline">
                  <div className="timelineTrack"><div className="timelineFill" style={{height:`${(activeProcessStep/(processExperience.length-1))*100}%`}}/></div>
                  {processExperience.map((step,i)=>{
                    const Icon=step.icon;
                    return <article className={`processStepBlock${activeProcessStep===i?' active':''}`} data-process-step={i} key={step.title} onClick={()=>setActiveProcessStep(i)}>
                      <div className="processStepMarker"><span>0{i+1}</span></div>
                      <div className="processStepCopy"><small>0{i+1} / {step.title.toUpperCase()}</small><h2>{step.title}</h2><h3>{step.kicker}</h3><p>{step.body}</p><div className="processDeliverables">{step.deliverables.map(item=><span key={item}>{item}</span>)}</div></div>
                    </article>
                  })}
                </div>
                <aside className="processVisualSticky">
                  <div className="processVisualCard">
                    <div className="processVisualHeader"><span>DEVSTAK / SYSTEM</span><b><i/> STAGE 0{activeProcessStep+1}</b></div>
                    <div className={`processDiagram diagram-${activeProcessStep}`}>
                      <div className="diagramCore"><div className="diagramCoreIcon"><ActiveProcessIcon /></div><b>{processExperience[activeProcessStep].title}</b><small>ACTIVE STAGE</small></div>
                      {processExperience[activeProcessStep].nodes.map((node,j)=><div className={`diagramNode node-${j}`} key={node}><span>{String(j+1).padStart(2,'0')}</span>{node}</div>)}
                      <div className="diagramLine line-a"/><div className="diagramLine line-b"/><div className="diagramLine line-c"/>
                    </div>
                    <div className="processVisualFooter"><span>{processExperience[activeProcessStep].deliverables.length} deliverables</span><span>Stage {activeProcessStep+1} of {processExperience.length}</span></div>
                  </div>
                  <div className="processVisualHint"><Sparkles size={15}/> Scroll through the process to update the system view.</div>
                </aside>
              </div>
              <section className="processGets"><div><small>WHAT YOU GET WITH EVERY PROJECT</small><h2>A process designed to <span>reduce surprises.</span></h2><p>Clear communication, defined milestones and production-minded engineering from first conversation to launch.</p></div><div className="processGetsGrid">{['Clear communication','Defined milestones','Maintainable code','Tested functionality','Production deployment','Post-launch support'].map(item=><div key={item}><Check size={16}/>{item}</div>)}</div></section>
              <div className="processBottomCta"><div><small>READY TO BUILD?</small><h3>Have an idea? Let's turn it into software.</h3></div><a className="primary" href="/contact">Start a Project <ArrowRight/></a></div>
            </>}
            {kind==='about'&&<AboutPage team={data}/>}
            {kind==='team'&&<div className="teamPublicGrid">{data.length?data.map((member:any)=><article className="teamPublicCard reveal visible" key={member.id}>{member.photoUrl?<img src={member.photoUrl} alt={member.name}/>:<div className="teamPublicPlaceholder">{String(member.name||'TM').split(' ').map((n:string)=>n[0]).slice(0,2).join('').toUpperCase()}</div>}<div className="teamPublicBody"><small>DEVSTAK TEAM</small><h3>{member.name}</h3><strong>{member.role}</strong>{member.bio&&<p>{member.bio}</p>}<div className="teamSocials">{member.linkedinUrl&&<a href={member.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin/></a>}{member.githubUrl&&<a href={member.githubUrl} target="_blank" rel="noreferrer"><Github/></a>}{member.websiteUrl&&<a href={member.websiteUrl} target="_blank" rel="noreferrer"><ExternalLink/></a>}</div></div></article>):<div className="teamEmpty"><small>TEAM</small><h2>The people behind<br/><em>DevStak.</em></h2><p>Team profiles will appear here once they are featured from the admin console.</p></div>}</div>}
            {kind==='contact'&&<div className="finalCtaGrid"><div><small>LET'S BUILD TOGETHER</small><h2>Ready to scale your <span>product?</span></h2><p>Tell us what you're building and we'll help identify the next practical step.</p></div><a className="finalFormCard" href="mailto:hello@devstak.com"><span>START A PROJECT</span><b>hello@devstak.com</b><i><ArrowRight/></i></a></div>}
          </>}
        </div>
      </section>}
    </main>
    <footer><div className="container foot"><div><a className="logo" href="/"><span>DEV</span>STAK</a><p>Web & software development for ambitious businesses.</p></div><div className="footLinks"><a href="/services">Services</a><a href="/projects">Case Studies</a><a href="/about">About</a><a href="/contact">Contact</a></div></div></footer>
    {galleryIndex!==null&&<div className="galleryLightbox" onClick={()=>setGalleryIndex(null)}><button className="galleryClose" onClick={()=>setGalleryIndex(null)}><X/></button><img src={gallery[galleryIndex]} alt={`${project?.title} screenshot ${galleryIndex+1}`} onClick={e=>e.stopPropagation()}/>{gallery.length>1&&<><button className="galleryPrev" onClick={e=>{e.stopPropagation();setGalleryIndex((galleryIndex-1+gallery.length)%gallery.length)}}><ArrowLeft/></button><button className="galleryNext" onClick={e=>{e.stopPropagation();setGalleryIndex((galleryIndex+1)%gallery.length)}}><ArrowRight/></button><div className="galleryCount">{galleryIndex+1} / {gallery.length}</div></>}</div>}
  </div>
}

function AboutPage({team}:{team:any[]}){
  const [philosophyActive,setPhilosophyActive]=useState(0);
  // Leadership and team profiles are managed from Admin → Team.
  // Prefer the member whose role identifies them as CEO/Founder; otherwise use the first featured team member.
  const founder=team.find((m:any)=>/\b(ceo|chief executive|founder|co-founder)\b/i.test(String(m.role||'')))||team[0];
  useEffect(()=>{
    const steps=Array.from(document.querySelectorAll<HTMLElement>('.aboutPhilosophyStep'));
    if(!steps.length)return;
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const index=Number((entry.target as HTMLElement).dataset.index||0);
          setPhilosophyActive(index);
        }
      });
    },{rootMargin:'-35% 0px -50% 0px',threshold:0});
    steps.forEach(step=>observer.observe(step));
    return()=>observer.disconnect();
  },[]);
  const principles=[
    ['01','Practical','Technology should solve a real business problem.'],
    ['02','Reliable','Software should be maintainable, secure and production-ready.'],
    ['03','Transparent','Clear communication throughout the project.'],
    ['04','Long-term','Build systems that can evolve with the business.']
  ];
  const stack=['React','TypeScript','Node.js','Express','MongoDB','PostgreSQL'];
  const buildItems=[['Web Applications','Business platforms, dashboards and internal tools.'],['SaaS Products','Focused products designed to grow with the business.'],['Backend Systems','APIs, authentication, integrations and real-time services.'],['Data Architecture','Practical data models, services and scalable foundations.'],['Business Automation','Workflows that reduce manual effort and improve visibility.']];
  return <div className="aboutPage">
    <section className="aboutHero">
      <div className="aboutHeroGrid">
        <div className="aboutHeroCopy">
          <small>DEVSTAK / COMPANY</small>
          <h1>Software built around<br/><span>real business needs.</span></h1>
          <p>DevStak is a software development studio focused on building practical web applications, SaaS products, backend systems and digital platforms.</p>
          <div className="aboutHeroActions"><a className="primary" href="/services">Explore Solutions <ArrowRight/></a><a className="textBtn" href="/contact">Start a Project <ArrowRight/></a></div>
        </div>
        <div className="aboutHeroSystem">
          <div className="aboutSystemTop"><span>DEVSTAK / ENGINEERING SYSTEM</span><b><i/> PRODUCTION READY</b></div>
          <div className="aboutDashboard">
            <div className="aboutDashboardHeader"><span>PLATFORM STATUS</span><b>LIVE</b></div>
            <div className="aboutDashboardRows">
              <div><span className="dashIcon"><Server/></span><strong>API</strong><small>Operational</small><em>●</em></div>
              <div><span className="dashIcon"><Database/></span><strong>Database</strong><small>Connected</small><em>●</em></div>
              <div><span className="dashIcon"><Rocket/></span><strong>Deployment</strong><small>Production</small><em>●</em></div>
            </div>
            <div className="aboutDashboardGraph">
              <div className="graphLabel"><span>System activity</span><b>+24.8%</b></div>
              <div className="graphBars">{[28,42,34,58,48,70,62,86,73,94].map((h,i)=><i key={i} style={{height:`${h}%`}}/> )}</div>
              <div className="graphAxis"><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span></div>
            </div>
            <div className="aboutDashboardFooter"><span>BUSINESS → SOFTWARE</span><b>DS CORE</b></div>
          </div>
          <div className="aboutSystemNode n1">Business goals</div><div className="aboutSystemNode n2">Architecture</div><div className="aboutSystemNode n3">Users</div><div className="aboutSystemNode n4">Production</div>
          <span className="aboutSystemLine l1"/><span className="aboutSystemLine l2"/><span className="aboutSystemLine l3"/>
        </div>
      </div>
    </section>

    <section className="aboutFounder section">
      <div className="container aboutFounderGrid">
        <div className="founderPortraitCard">
          <div className="founderPortrait">{founder?.photoUrl?<img src={founder.photoUrl} alt={founder.name||'DevStak leadership'}/>:<><span>{founder?.name?String(founder.name).split(' ').map((n:string)=>n[0]).slice(0,2).join('').toUpperCase():'DS'}</span><small>{founder?.role||'LEADERSHIP'}</small></>}</div>
          <div className="founderCardMeta"><span>{founder?.role||'DEVSTAK LEADERSHIP'}</span><b>{founder?.name||'DevStak Team'}</b><small>Public profile managed from Admin → Team</small></div>
        </div>
        <div className="founderCopy">
          <small>THE PERSON BEHIND THE PRODUCT</small>
          <h2>Behind <span>DevStak.</span></h2>
          <p className="aboutLead">DevStak was created to bridge the gap between business ideas and reliable software. The focus is simple: understand the problem first, choose the right technical direction, then build something people can actually use.</p>
          <p className="founderStory">{founder?.bio||'DevStak is led by a hands-on engineering team focused on backend systems, scalable web applications and SaaS products. The studio brings that engineering mindset into a business-focused development approach.'}</p>
          <div className="founderTags"><span>Leadership</span><span>Backend Engineering</span><span>SaaS Development</span></div>
        </div>
      </div>
    </section>

    <section className="aboutPrinciples section">
      <div className="container"><div className="head"><div><small>WHAT DEVSTAK STANDS FOR</small><h2>Built on four <span>principles.</span></h2></div><p>The studio keeps the engineering approach practical, transparent and connected to the business outcome.</p></div>
      <div className="principleGrid">{principles.map(([num,title,body])=><article key={num}><b>{num}</b><h3>{title}</h3><p>{body}</p></article>)}</div></div>
    </section>

    <section className="aboutBuild section">
      <div className="container"><div className="head"><div><small>WHAT WE BUILD</small><h2>From idea <span>to production.</span></h2></div><p>Capabilities that connect naturally with the services, process and case studies across DevStak.</p></div>
      <div className="buildGrid">{buildItems.map(([title,body],i)=><a className="buildCard" href="/services" key={title}><span>0{i+1}</span><h3>{title}</h3><p>{body}</p><ArrowRight/></a>)}</div><a className="aboutInlineCta" href="/services">Explore our solutions <ArrowRight/></a></div>
    </section>

    <section className="aboutPhilosophy section">
      <div className="container"><div className="philosophyPanel"><div><small>ENGINEERING PHILOSOPHY</small><h2>Good software starts with <span>understanding the problem.</span></h2><p>Business goals shape the product direction before architecture and implementation decisions are made.</p><div className="philosophyStatus"><span>ACTIVE STAGE</span><b>0{philosophyActive+1} / 06</b></div></div><div className="philosophyFlow">{['Business goal','User needs','Architecture','Development','Testing','Production'].map((label,i)=><div key={label}><button type="button" className={`aboutPhilosophyStep ${philosophyActive===i?'active':''}`} data-index={i} onClick={()=>setPhilosophyActive(i)}><b>0{i+1}</b><span>{label}</span><i className="flowPulse"/></button>{i<5&&<em className={philosophyActive>i?'filled':''}/>}</div>)}</div></div></div>
    </section>

    <section className="aboutStack section">
      <div className="container aboutStackGrid"><div><small>THE STACK BEHIND DEVSTAK</small><h2>Technology follows <span>the product.</span></h2><p>We choose technology based on the product, constraints and long-term needs—not the other way around.</p></div><div className="aboutStackPills">{stack.map((item,i)=><span key={item}><b>0{i+1}</b>{item}</span>)}</div></div>
    </section>

    <section className="aboutFinalCta"><div className="container"><div><small>READY TO BUILD?</small><h2>Have a product <span>in mind?</span></h2><p>Let's turn your idea into something people can actually use.</p></div><a className="primary" href="/contact">Start a Project <ArrowRight/></a></div></section>
  </div>
}

function ProjectsIndex({projects}:{projects:any[]}){
  const featured=projects.find((p:any)=>p.featured)||projects[0];
  const others=projects.filter((p:any)=>p.id!==featured?.id);
  const tech=(p:any)=>p.technologies?.map((t:any)=>t.technology?.name).filter(Boolean).slice(0,6)||[];
  const outcomes=(p:any)=>p.highlights?.length?p.highlights:['Case study details available on request'];
  return <div className="projectsIndex">
    <div className="projectsIntro"><div><span className="sectionEyebrow">SELECTED WORK</span><h2>Software we've designed,<br/><em>built and shipped.</em></h2></div><p>Real products, practical architecture and hands-on engineering across web applications, SaaS platforms and backend systems.</p></div>
    {featured&&<article className="featuredCasePublic">
      <a className="featuredCasePublicVisual" href={`/projects/${featured.slug}`}>{featured.coverImage?<img src={featured.coverImage} alt={featured.title}/>:<div className="featuredMock"><span>DEVSTAK / {featured.title.toUpperCase()}</span><b>PRODUCT<br/>DASHBOARD</b><i>● SYSTEM ONLINE</i></div>}<span className="featuredCaseBadge">FEATURED CASE STUDY</span></a>
      <div className="featuredCasePublicBody"><div className="caseEyebrow"><span>{featured.type}</span><span>Featured project</span></div><h3>{featured.title}</h3><p className="caseLead">{featured.shortDescription}</p><div className="caseMetaStrip"><div><small>TECHNOLOGY</small><b>{tech(featured).join(' · ')||'Full-stack engineering'}</b></div><div><small>TYPE</small><b>{featured.type}</b></div><div><small>STATUS</small><b>{featured.status==='PUBLISHED'?'Production / Published':'In progress'}</b></div></div><div className="caseOutcomeBlock"><small>WHAT WE BUILT</small><div className="caseOutcomeList">{outcomes(featured).slice(0,5).map((x:string)=><span key={x}><Check/>{x}</span>)}</div></div><a className="caseBtn" href={`/projects/${featured.slug}`}>View Case Study <ArrowRight/></a></div>
    </article>}
    {others.length>0&&<section className="moreProjectsPublic"><div className="projectSectionHead"><div><span className="sectionEyebrow">MORE PROJECTS</span><h2>More <em>work.</em></h2></div><span className="projectCount">{projects.length} projects</span></div><div className="publicProjectGrid">{others.map((x:any)=><a className="publicProjectCard" href={`/projects/${x.slug}`} key={x.id}><div className="publicProjectVisual">{x.coverImage?<img src={x.coverImage} alt={x.title}/>:<div className="visualFallback"><span>{x.title}</span><small>{x.type}</small></div>}<span className="visualArrow"><ArrowRight/></span></div><div className="publicProjectBody"><div className="caseEyebrow"><span>{x.type}</span><span>Case study</span></div><h3>{x.title}</h3><p>{x.shortDescription}</p><div className="projectTags">{tech(x).map((t:string)=><span key={t}>{t}</span>)}</div><span className="caseBtn">Explore project <ArrowRight/></span></div></a>)}</div></section>}
    <div className="projectsBottomCta"><div><small>HAVE A PROJECT IN MIND?</small><h3>Let's turn the idea into <em>software.</em></h3></div><a className="primary" href="/contact">Start a Project <ArrowRight/></a></div>
  </div>
}

function ProjectCaseStudy({project,gallery,galleryIndex,setGalleryIndex,relatedProjects}:{project:any;gallery:string[];galleryIndex:number|null;setGalleryIndex:(n:number|null)=>void;relatedProjects:any[]}){
 const related=project.testimonials||[];
 return <div className="projectCaseStudy">
   <section className="projectHero"><div className="container">
     <a className="backLink" href="/projects"><ArrowLeft/> Back to case studies</a>
     <div className="projectKicker">DEVSTAK / CASE STUDY</div>
     <div className="projectHeroGrid"><div className="projectHeroCopy"><span className="projectType">{project.type}</span><h1>{project.title}</h1><p>{project.shortDescription}</p><div className="caseTech">{project.technologies?.map((t:any)=><span key={t.technology.id}>{t.technology.name}</span>)}</div><div className="projectActions">{project.liveUrl&&<a className="primary" href={project.liveUrl} target="_blank" rel="noreferrer">Visit live project <ExternalLink/></a>}{project.githubUrl&&<a className="secondary" href={project.githubUrl} target="_blank" rel="noreferrer">View source <Github/></a>}</div></div><div className="projectHeroMeta"><span>PROJECT INFO</span><div><small>Type</small><b>{project.type}</b></div><div><small>Published</small><b>{new Date(project.createdAt).getFullYear()}</b></div><div><small>Role</small><b>Full-Stack Development</b></div></div></div>
   </div></section>
   <nav className="projectAnchorNav"><div className="container"><a href="#project-overview">Overview</a>{project.problem&&<a href="#challenge">Challenge</a>}{project.solution&&<a href="#solution">Solution</a>}<a href="#technology">Technology</a>{gallery.length>1&&<a href="#gallery">Gallery</a>}</div></nav>
   <section className="projectVisualSection"><div className="container"><button className="projectMainVisual" onClick={()=>setGalleryIndex(0)} aria-label={`Open ${project.title} gallery`}>{gallery[0]?<img src={gallery[0]} alt={project.title}/>:<div className="projectVisualEmpty">Project preview</div>}<span>View gallery <ArrowRight/></span></button><div className="projectGalleryThumbs">{gallery.slice(0,5).map((url:string,i:number)=><button key={url+i} onClick={()=>setGalleryIndex(i)} className={i===0?'active':''}><img src={url} alt={`${project.title} screenshot ${i+1}`}/></button>)}</div></div></section>
   <section id="project-overview" className="projectOverview"><div className="container projectTwoCol"><div><span className="sectionEyebrow">THE PROJECT</span><h2>Built around the<br/><em>real workflow.</em></h2></div><div><p className="projectLead">{project.description}</p></div></div></section>
   {(project.problem||project.solution)&&<section id="challenge" className="projectStory"><div className="container storyColumns">{project.problem&&<article><span className="sectionEyebrow">01 / THE CHALLENGE</span><h3>The problem</h3><p>{project.problem}</p></article>}{project.solution&&<article id="solution"><span className="sectionEyebrow">02 / THE SOLUTION</span><h3>The solution</h3><p>{project.solution}</p></article>}</div></section>}
   {(project.highlights?.length>0)&&<section className="projectCapabilities"><div className="container"><div className="projectSectionHead"><div><span className="sectionEyebrow">PROJECT CAPABILITIES</span><h2>What the product <em>delivers.</em></h2></div><p>Key capabilities and outcomes represented by this project.</p></div><div className="capabilityGrid">{project.highlights.map((x:string,i:number)=><article key={x}><span>0{i+1}</span><h3>{x}</h3><p>Designed as part of the project's core user experience.</p></article>)}</div></div></section>}
   <section id="technology" className="projectTechSection"><div className="container"><div className="projectSectionHead"><div><span className="sectionEyebrow">TECHNOLOGY</span><h2>The stack behind<br/><em>the product.</em></h2></div><p>Technologies used to build and ship this project.</p></div><div className="techCarousel" aria-label="Technologies used in this project"><div className="techCarouselViewport"><div className="techCarouselTrack">{[...(project.technologies||[]), ...(project.technologies||[])].map((t:any,i:number)=><div className="techCarouselItem" key={`${t.technology.id}-${i}`}><span className="techIcon"><TechnologyIcon name={t.technology.name}/></span><span className="techName">{t.technology.name}</span><span className="techCategory">{t.technology.category||'Technology'}</span></div>)}</div></div></div></div></section>
   {gallery.length>1&&<section id="gallery" className="projectGallerySection"><div className="container"><div className="projectSectionHead"><div><span className="sectionEyebrow">PROJECT GALLERY</span><h2>Inside the <em>experience.</em></h2></div><p>Additional screens and product views beyond the primary project preview.</p></div><div className="fullGallery">{gallery.slice(1).map((url:string,i:number)=><button key={url+i} onClick={()=>setGalleryIndex(i+1)}><img src={url} alt={`${project.title} additional screenshot ${i+2}`}/><span>0{i+2}</span></button>)}</div></div></section>}
   {related.length>0&&<section className="projectTestimonials"><div className="container"><div className="projectSectionHead"><div><span className="sectionEyebrow">CLIENT PROOF</span><h2>What they <em>said.</em></h2></div></div><div className="testimonialGrid">{related.map((t:any)=><article key={t.id}><Quote/><p>“{t.content}”</p><b>{t.client}</b><small>{[t.role,t.company].filter(Boolean).join(' · ')}</small></article>)}</div></div></section>}
   {relatedProjects.length>0&&<section className="projectRelated"><div className="container"><div className="projectSectionHead"><div><span className="sectionEyebrow">MORE CASE STUDIES</span><h2>More <em>work.</em></h2></div><a className="textBtn" href="/projects">View all case studies <ArrowRight/></a></div><div className="relatedGrid">{relatedProjects.map((x:any)=><a key={x.id} href={`/projects/${x.slug}`} className="relatedCard">{x.coverImage?<img src={x.coverImage} alt={x.title}/>:<div className="relatedPlaceholder">{x.title.slice(0,2).toUpperCase()}</div>}<div><small>{x.type}</small><h3>{x.title}</h3><p>{x.shortDescription}</p><ArrowRight/></div></a>)}</div></div></section>}
   <section className="projectCta"><div className="container"><span>HAVE A SIMILAR PROJECT?</span><h2>Let's build your<br/><em>next system.</em></h2><a className="primary" href="/contact">Start a Project <ArrowRight/></a></div></section>
 </div>
}
function RouteApp(){const [path,setPath]=useState(window.location.pathname);useEffect(()=>{const onPop=()=>setPath(window.location.pathname);window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop)},[]);if(path==='/'||path==='/index.html')return <App/>;const parts=path.split('/').filter(Boolean);if(parts[0]==='projects'&&parts[1])return <PublicPage kind="project" slug={parts[1]}/>;if(['services','projects','process','about','team','contact'].includes(parts[0]))return <PublicPage kind={parts[0]}/>;return <App/>}

createRoot(document.getElementById('root')!).render(<StrictMode><RouteApp/></StrictMode>);
