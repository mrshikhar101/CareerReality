import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { Home, Search, Sun, Moon, User, LogIn, LogOut, MessageSquareText, X, ChevronDown, ChevronUp, BriefcaseBusiness, FlaskConical, Palette, Scale, Laptop, Dumbbell, GraduationCap, Mail, Info, Youtube, Award, BarChart, BookOpen, CheckCircle, Clock, Lightbulb, TrendingUp } from 'lucide-react'; // Added new icons

// --- Context for global state ---
const AppContext = createContext();

// --- Mock Data (Keep as is, AI will recommend from or suggest new based on answers) ---
const MOCK_CAREERS = [
    {
        id: 'doctor-pov',
        title: 'A Day in the Life of a Doctor',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '12 min',
        tagline: 'Saving lives, one day at a time.',
        description: 'Experience the demanding yet rewarding life of a medical doctor. From early morning rounds to emergency surgeries, this video covers the daily responsibilities and challenges faced by healthcare professionals.',
        field: 'Medicine & Health',
        tags: ['Office-based', 'Demanding', 'Rewarding', 'Science', 'Healthcare'],
        dailySchedule: [
            '7:00 AM - Hospital rounds and patient check-ins.',
            '9:00 AM - Morning surgery or clinic appointments.',
            '1:00 PM - Lunch break (if time permits) and paperwork.',
            '2:00 PM - Afternoon consultations and follow-ups.',
            '5:00 PM - End of shift, handover to night staff (or on-call duties).'
        ],
        skillsRequired: ['Critical Thinking', 'Problem-Solving', 'Empathy', 'Communication', 'Stress Management'],
        pros: ['High impact on lives', 'Intellectually stimulating', 'Good earning potential'],
        cons: ['Long hours', 'High stress', 'Extensive education required']
    },
    {
        id: 'nurse-pov',
        title: 'A Day in the Life of a Nurse',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '12 min',
        tagline: 'Caring for patients, supporting health.',
        description: 'Gain insight into the compassionate and demanding role of a Registered Nurse. From administering medication and monitoring vital signs to comforting patients and educating families, nurses are at the frontline of healthcare.',
        field: 'Medicine & Health',
        tags: ['Hands-on', 'Demanding', 'Empathetic', 'Shift-work', 'Patient-focused'],
        dailySchedule: [
            '7:00 AM - Shift handover, patient assessments and vital sign checks.',
            '9:00 AM - Administering medications and treatments.',
            '12:00 PM - Assisting with doctor rounds, charting patient progress.',
            '1:00 PM - Lunch break (often flexible).',
            '2:00 PM - Patient education, discharge planning, and family communication.',
            '4:00 PM - Responding to emergencies, preparing for next shift handover.',
            '7:00 PM - End of shift, documentation completion.'
        ],
        skillsRequired: ['Empathy', 'Critical Thinking', 'Communication', 'Stress Management', 'Attention to Detail'],
        pros: ['Direct impact on patient lives', 'High demand and job security', 'Diverse work environments'],
        cons: ['Physically and emotionally demanding', 'Long, irregular hours', 'Exposure to illness/injury']
    },
    {
        id: 'marketing-manager-pov',
        title: 'A Day in the Life of a Marketing Manager',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '10 min',
        tagline: 'Strategizing for brand success.',
        description: 'Explore the dynamic world of a marketing manager. See how they develop strategies, manage campaigns, analyze market trends, and work with various teams to promote products or services.',
        field: 'Business & Management',
        tags: ['Office-based', 'Strategic', 'Communication', 'Dynamic'],
        dailySchedule: [
            '9:00 AM - Review marketing analytics and campaign performance.',
            '10:00 AM - Team meeting to discuss new campaign ideas.',
            '11:30 AM - Content planning and creation review.',
            '1:00 PM - Lunch break.',
            '2:00 PM - Meeting with sales or product development teams.',
            '3:30 AM - Budget management and vendor communication.',
            '5:00 AM - Market research and competitor analysis.'
        ],
        skillsRequired: ['Strategic Thinking', 'Communication', 'Analytics', 'Creativity', 'Project Management'],
        pros: ['Dynamic and varied work', 'Opportunity to be creative', 'Impact on business growth'],
        cons: ['Pressure to meet targets', 'Constant market changes', 'Long hours during campaigns']
    },
    {
         id: 'financial-analyst-pov',
        title: 'A Day in the Life of a Financial Analyst',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '9 min',
        tagline: 'Navigating markets, advising on investments.',
        description: 'Step into the world of finance with a data-driven financial analyst. Learn how they research economic trends, analyze financial statements, and provide recommendations to clients or companies on investment strategies.',
        field: 'Business & Management',
        tags: ['Analytical', 'Office-based', 'Fast-paced', 'Data-driven', 'Strategic'],
        dailySchedule: [
            '7:00 AM - Early morning market research and news review.',
            '8:30 AM - Team meeting to discuss market outlook and portfolio performance.',
            '9:30 AM - Financial modeling and valuation of companies/assets.',
            '1:00 PM - Lunch break.',
            '2:00 PM - Client presentations or internal strategy sessions.',
            '4:00 PM - Preparing reports and updating financial dashboards.',
            '6:00 PM - Networking events or professional development.'
        ],
        skillsRequired: ['Financial Modeling', 'Data Analysis (Excel, Python)', 'Attention to Detail', 'Critical Thinking', 'Communication'],
        pros: ['High earning potential', 'Intellectually challenging', 'Fast-paced environment'],
        cons: ['High pressure and stress', 'Long hours common', 'Market volatility can be unpredictable']
    },
    {
        id: 'graphic-designer-pov',
        title: 'A Day in the Life of a Graphic Designer',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '8 min',
        tagline: 'Bringing ideas to visual life.',
        description: 'Follow a graphic designer through their creative process, from client briefs to final designs. See how they use various tools and software to create stunning visuals for brands and campaigns.',
        field: 'Arts & Design',
        tags: ['Creative', 'Office-based', 'Flexible', 'Visual'],
        dailySchedule: [
            '9:00 AM - Check emails and plan daily tasks.',
            '10:00 AM - Client meeting or brainstorming session.',
            '11:30 AM - Design work on current projects (logos, websites, marketing materials).',
            '1:00 PM - Lunch break.',
            '2:00 PM - Revisions based on feedback, preparing files for print/web.',
            '5:00 PM - Portfolio updates or learning new design trends.'
        ],
        skillsRequired: ['Creativity', 'Software Proficiency (Adobe Suite)', 'Attention to Detail', 'Communication', 'Time Management'],
        pros: ['Express creativity', 'Diverse projects', 'Potential for remote work'],
        cons: ['Client revisions can be challenging', 'Tight deadlines', 'Competitive field']
    },
    {
        id: 'architect-pov',
        title: 'A Day in the Life of an Architect',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '10 min',
        tagline: 'Designing the spaces we live and work in.',
        description: 'Witness the blend of creativity and precision in an architect\'s day. From sketching initial concepts to overseeing construction, learn how they bring structures to life, ensuring both aesthetics and functionality.',
        field: 'Arts & Design',
        tags: ['Creative', 'Office-based', 'Technical', 'Project-based', 'Collaborative'],
        dailySchedule: [
            '9:00 AM - Client meeting to discuss project requirements or present designs.',
            '10:30 AM - Drafting and 3D modeling using CAD software.',
            '1:00 PM - Lunch break.',
            '2:00 PM - Site visit to review construction progress or troubleshoot issues.',
            '4:00 PM - Coordinating with engineers, contractors, and urban planners.',
            '5:30 PM - Researching building codes and sustainable design practices.'
        ],
        skillsRequired: ['Spatial Reasoning', 'Design Software (AutoCAD, SketchUp)', 'Attention to Detail', 'Problem-Solving', 'Communication'],
        pros: ['Creative expression', 'Tangible results (buildings)', 'High earning potential'],
        cons: ['Long hours and tight deadlines', 'Extensive education and licensing', 'Bureaucracy in permits']
    },
    {
        id: 'civil-engineer-pov',
        title: 'A Day in the Life of a Civil Engineer',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '11 min',
        tagline: 'Building the infrastructure of our world.',
        description: 'Discover the practical application of engineering principles in the life of a civil engineer. They design, build, and maintain infrastructure projects like roads, bridges, buildings, and water systems.',
        field: 'Science & Technology',
        tags: ['Outdoor', 'Technical', 'Problem-Solving', 'Project-based', 'Analytical'],
        dailySchedule: [
            '8:00 AM - Site visit: inspecting construction progress and addressing issues.',
            '10:00 AM - Design work: using software to create blueprints and models.',
            '12:00 PM - Lunch break.',
            '1:00 PM - Meeting with contractors, clients, or government officials.',
            '3:00 PM - Analyzing data and ensuring compliance with safety regulations.',
            '5:00 PM - Preparing bids for new projects or researching new materials.'
        ],
        skillsRequired: ['Structural Analysis', 'Project Management', 'Problem-Solving', 'Mathematics', 'Attention to Detail'],
        pros: ['Tangible impact on society', 'Varied projects', 'Good job security and pay'],
        cons: ['Long hours during project deadlines', 'Exposure to construction sites', 'Strict regulatory compliance']
    },
    {
        id: 'software-engineer-pov',
        title: 'A Day in the Life of a Software Engineer',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '9 min',
        tagline: 'Building the digital world.',
        description: 'Dive into the daily routine of a software engineer. From coding and debugging to collaborating with teams and deploying new features, understand what it takes to build and maintain software applications.',
        field: 'Science & Technology',
        tags: ['IT', 'Office-based', 'Problem-Solving', 'Collaborative'],
        dailySchedule: [
            '9:00 AM - Daily stand-up meeting.',
            '9:30 AM - Coding new features or fixing bugs.',
            '12:30 PM - Lunch break.',
            '1:30 PM - Code reviews and pair programming.',
            '3:30 PM - Testing and deployment.',
            '5:00 PM - Planning for future sprints or learning new technologies.'
        ],
        skillsRequired: ['Programming Languages', 'Problem-Solving', 'Debugging', 'Version Control', 'Teamwork'],
        pros: ['High demand', 'Good salary', 'Creative problem-solving'],
        cons: ['Can be stressful', 'Long hours sometimes', 'Constant learning required']
    },
    {
        id: 'data-scientist-pov',
        title: 'A Day in the Life of a Data Scientist',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '11 min',
        tagline: 'Unlocking insights from data.',
        description: 'Explore the analytical world of a data scientist. See how they collect, clean, analyze, and interpret large datasets to help businesses make informed decisions and predict future trends.',
        field: 'Science & Technology',
        tags: ['IT', 'Analytical', 'Remote-friendly', 'Problem-Solving'],
        dailySchedule: [
            '9:00 AM - Stand-up meeting with the team.',
            '9:30 AM - Data cleaning and pre-processing.',
            '12:00 PM - Lunch break.',
            '1:00 PM - Model building and algorithm development.',
            '3:00 PM - Data visualization and report generation.',
            '5:00 PM - Researching new techniques or collaborating on projects.'
        ],
        skillsRequired: ['Statistics', 'Programming (Python/R)', 'Machine Learning', 'Data Visualization', 'Communication'],
        pros: ['High demand', 'Good salary', 'Intellectually challenging'],
        cons: ['Can be repetitive', 'Requires continuous learning', 'Dealing with messy data']
    },
    {
        id: 'social-worker-pov',
        title: 'A Day in the Life of a Social Worker',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '10 min',
        tagline: 'Advocating for well-being, building stronger communities.',
        description: 'Understand the vital work of a social worker who supports individuals, families, and communities facing various challenges. This role involves counseling, connecting clients to resources, and advocating for social justice.',
        field: 'Government Jobs',
        tags: ['Empathetic', 'Fieldwork', 'Communication', 'Challenging', 'Supportive'],
        dailySchedule: [
            '9:00 AM - Reviewing client cases and planning daily visits.',
            '10:00 AM - Home visits or appointments with clients for counseling and assessment.',
            '1:00 PM - Lunch break.',
            '2:00 PM - Liaising with community organizations, government agencies, or healthcare providers.',
            '4:00 PM - Documentation and record-keeping for client progress.',
            '5:00 PM - Attending team meetings or professional development workshops.'
        ],
        skillsRequired: ['Empathy', 'Active Listening', 'Problem-Solving', 'Communication', 'Crisis Intervention'],
        pros: ['Directly helps people', 'Meaningful and impactful work', 'Diverse client populations'],
        cons: ['Emotionally demanding', 'Potential for burnout', 'Bureaucracy and limited resources']
    },
    {
        id: 'urban-planner-pov',
        title: 'A Day in the Life of an Urban Planner',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '11 min',
        tagline: 'Shaping the future of cities.',
        description: 'Explore the role of an urban planner, responsible for designing and developing cities and communities. This includes planning land use, transportation, and infrastructure to create sustainable and livable environments.',
        field: 'Government Jobs',
        tags: ['Strategic', 'Analytical', 'Collaborative', 'Project-based', 'Office-based'],
        dailySchedule: [
            '9:00 AM - Meeting with community members or stakeholders to gather input on projects.',
            '10:30 AM - Working on zoning regulations and land-use plans.',
            '1:00 PM - Lunch break.',
            '2:00 PM - Analyzing data on population, traffic, and environmental impact.',
            '3:30 PM - Presenting plans to city councils or government agencies.',
            '5:00 PM - Researching best practices in urban design and sustainability.'
        ],
        skillsRequired: ['Spatial Reasoning', 'Data Analysis', 'Communication', 'Problem-Solving', 'Strategic Thinking'],
        pros: ['Impact on community development', 'Varied and challenging projects', 'Opportunity for leadership'],
        cons: ['Bureaucracy and political considerations', 'Long-term projects with slow progress', 'Public scrutiny and differing opinions']
    },
    {
        id: 'freelance-writer-pov',
        title: 'A Day in the Life of a Freelance Writer',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '10 min',
        tagline: 'Crafting compelling content, on your own terms.',
        description: 'Discover the flexible world of a freelance writer. From blog posts and website copy to articles and marketing materials, see how they manage their time, find clients, and deliver high-quality content.',
        field: 'Freelancing & Remote',
        tags: ['Remote', 'Creative', 'Flexible', 'Self-directed', 'Communication'],
        dailySchedule: [
            '9:00 AM - Checking emails and responding to client inquiries.',
            '10:00 AM - Working on writing projects, conducting research.',
            '1:00 PM - Lunch break.',
            '2:00 PM - Pitching ideas to potential clients or networking.',
            '3:00 PM - Editing and proofreading work.',
            '4:00 PM - Administrative tasks: invoicing, tracking income, and planning schedule.'
        ],
        skillsRequired: ['Writing', 'Communication', 'Time Management', 'Self-Discipline', 'Marketing'],
        pros: ['Flexibility and independence', 'Variety of projects', 'Potential for high income'],
        cons: ['Inconsistent income', 'Need for self-discipline', 'Finding clients can be challenging']
    },
    {
        id: 'virtual-assistant-pov',
        title: 'A Day in the Life of a Virtual Assistant',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '9 min',
        tagline: 'Supporting businesses remotely, making things happen.',
        description: 'Explore the world of virtual assistance, providing administrative, technical, or creative assistance to clients from a remote location. Learn how they manage tasks, communicate effectively, and keep businesses running smoothly.',
        field: 'Freelancing & Remote',
        tags: ['Remote', 'Organized', 'Communication', 'Multi-tasking', 'Supportive'],
        dailySchedule: [
            '9:00 AM - Checking emails and prioritizing tasks for the day.',
            '10:00 AM - Responding to client inquiries and scheduling appointments.',
            '11:00 AM - Managing social media accounts or creating content.',
            '1:00 PM - Lunch break.',
            '2:00 PM - Data entry, research, or preparing documents.',
            '3:00 PM - Project management or coordinating with other team members.',
            '4:00 PM - Invoicing and tracking billable hours.'
        ],
        skillsRequired: ['Organization', 'Communication', 'Time Management', 'Technical Proficiency', 'Problem-Solving'],
        pros: ['Flexibility and work-life balance', 'Variety of tasks and industries', 'Potential for growth'],
        cons: ['Isolation', 'Need for self-discipline', 'Finding reliable clients']
    },
     {
        id: 'personal-trainer-pov',
        title: 'A Day in the Life of a Personal Trainer',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '11 min',
        tagline: 'Guiding clients to achieve their fitness goals.',
        description: 'Get a glimpse into the active and motivating world of a personal trainer. From designing workout plans to providing nutritional advice and offering encouragement, see how they help individuals transform their lives.',
        field: 'Sports & Fitness',
        tags: ['Active', 'People-oriented', 'Motivating', 'Flexible', 'Health-focused'],
        dailySchedule: [
            '6:00 AM - Morning training sessions with early-bird clients.',
            '9:00 AM - Designing personalized workout plans.',
            '11:00 AM - Meeting with new clients for consultations.',
            '1:00 PM - Lunch break and personal workout.',
            '2:00 PM - Afternoon training sessions.',
            '5:00 PM - Administrative tasks: scheduling, billing, and marketing.',
            '6:00 PM - Evening training sessions.'
        ],
        skillsRequired: ['Fitness Knowledge', 'Communication', 'Motivation', 'Interpersonal Skills', 'Business Skills'],
        pros: ['Helping others achieve their goals', 'Active and varied work', 'Flexible schedule potential'],
        cons: ['Irregular hours', 'Physically demanding', 'Income depends on client base']
    },
    {
        id: 'sports-coach-pov',
        title: 'A Day in the Life of a Sports Coach',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '12 min',
        tagline: 'Leading athletes to victory, on and off the field.',
        description: 'Explore the strategic and leadership-focused role of a sports coach. From planning practices and developing game strategies to mentoring athletes and fostering teamwork, see how they shape individuals and teams.',
        field: 'Sports & Fitness',
        tags: ['Leadership', 'Strategic', 'Communication', 'Motivating', 'Team-oriented'],
        dailySchedule: [
            '2:00 PM - Planning and preparing for practice sessions.',
            '3:30 PM - Conducting practice with the team.',
            '6:00 PM - Game day: managing the team during competition.',
            '8:00 PM - Post-game analysis and feedback.',
            '9:00 PM - Scouting opponents and developing game strategies.',
            '10:00 PM - Administrative tasks: communication with parents or management.'
        ],
        skillsRequired: ['Leadership', 'Communication', 'Strategic Thinking', 'Motivation', 'Sports Knowledge'],
        pros: ['Passion for sports', 'Opportunity to mentor', 'Team environment'],
        cons: ['Long and irregular hours', 'High-pressure situations', 'Travel may be required']
    },
    {
         id: 'teacher-pov',
        title: 'A Day in the Life of a Teacher',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '11 min',
        tagline: 'Shaping young minds, inspiring futures.',
        description: 'Step into the classroom and experience the day of a teacher. From lesson planning and instruction to student engagement and grading, understand the dedication required to educate the next generation.',
        field: 'Education',
        tags: ['Office-based', 'Rewarding', 'Communication', 'Patience'],
        dailySchedule: [
            '7:30 AM - Arrive at school, prepare classroom.',
            '8:00 AM - Student arrival, morning duties.',
            '8:30 AM - First class instruction.',
            '12:00 PM - Lunch break and duty.',
            '1:00 PM - Afternoon classes.',
            '3:00 PM - Student dismissal, after-school activities.',
            '4:00 PM - Lesson planning, grading, parent communication.'
        ],
        skillsRequired: ['Patience', 'Communication', 'Classroom Management', 'Adaptability', 'Subject Matter Expertise'],
        pros: ['Impact on students', 'Stable career', 'Holidays off'],
        cons: ['Low pay compared to effort', 'Large class sizes', 'Emotional labor']
    },
    {
        id: 'instructional-designer-pov',
        title: 'A Day in the Life of an Instructional Designer',
        youtubeId: 'wv4qJQkIp_w', // Valid Placeholder video ID
        duration: '10 min',
        tagline: 'Creating engaging and effective learning experiences.',
        description: 'Explore the world of instructional design, where professionals develop training materials and courses for various audiences. Learn how they combine educational theory with technology to create impactful learning solutions.',
        field: 'Education',
        tags: ['Creative', 'Analytical', 'Communication', 'Technology', 'Project-based'],
        dailySchedule: [
            '9:00 AM - Meeting with subject matter experts to gather content.',
            '10:30 AM - Designing learning activities and assessments.',
            '1:00 PM - Lunch break.',
            '2:00 PM - Developing e-learning modules using authoring tools.',
            '3:30 PM - Reviewing and revising course materials based on feedback.',
            '4:30 PM - Researching new trends in instructional design and educational technology.'
        ],
        skillsRequired: ['Curriculum Development', 'Communication', 'Technology Skills', 'Project Management', 'Creativity'],
        pros: ['Impact on learning and development', 'Varied and challenging projects', 'Growing field'],
        cons: ['Can be detail-oriented and time-consuming', 'Need to stay updated with technology', 'May involve working with diverse stakeholders']
    }
];

const MOCK_CATEGORIES = [
    { name: 'Medicine & Health', icon: <Home className="w-8 h-8" /> }, // Reusing Home for now, replace with specific icons
    { name: 'Business & Management', icon: <BriefcaseBusiness className="w-8 h-8" /> },
    { name: 'Arts & Design', icon: <Palette className="w-8 h-8" /> },
    { name: 'Government Jobs', icon: <Scale className="w-8 h-8" /> },
    { name: 'Science & Technology', icon: <FlaskConical className="w-8 h-8" /> },
    { name: 'Freelancing & Remote', icon: <Laptop className="w-8 h-8" /> },
    { name: 'Sports & Fitness', icon: <Dumbbell className="w-8 h-8" /> },
    { name: 'Education', icon: <GraduationCap className="w-8 h-8" /> },
];

const MOCK_TESTIMONIALS = [
    { quote: "Career Reality helped me see what being a doctor *really* entails. It's not just what you see on TV!", author: "Aisha K., Student" },
    { quote: "The day-in-the-life videos are incredibly insightful. It gave my son a much-needed reality check.", author: "Mr. Sharma, Parent" },
    { quote: "This platform is a game-changer for career counseling. Highly recommend!", author: "Ms. Lee, Career Counselor" },
];

// --- Firebase Initialization (FOR LOCAL DEVELOPMENT) ---
let firebaseApp;
let firebaseAuth;
let firestoreDb;

try {
    const localAppId = 'career-reality-local-app-id'; // A simple string for local identification
    const localFirebaseConfig = {
        apiKey: "AIzaSyAcRv_6wHopQg1j895ircBDQ3TtSzHe_JI",
        authDomain: "careerrealityapp.firebaseapp.com",
        projectId: "careerrealityapp",
        storageBucket: "careerrealityapp.firebasestorage.app",
        messagingSenderId: "862577337335",
        appId: "1:862577337335:web:6db3785010bced8c7dc4f2",
        measurementId: "G-6FLKTTJX05"
    };

    if (localFirebaseConfig.apiKey && localFirebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
        firebaseApp = initializeApp(localFirebaseConfig);
        firebaseAuth = getAuth(firebaseApp);
        firestoreDb = getFirestore(firebaseApp);
        console.log("Firebase initialized with local config.");
    } else {
        console.warn("Firebase config not fully set up for local development. Google Login and Firestore access will not work. Please replace placeholders in App.js.");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

// --- Components ---

// Header Component
const Header = () => {
    const { theme, setTheme, user, setCurrentPage, handleLoginLogout, setShowChatbot } = useContext(AppContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <header className={`py-4 px-6 shadow-md ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setCurrentPage('home')}>
                    Career Reality
                </h1>
                <nav className="hidden md:flex items-center space-x-6">
                    <button onClick={() => setCurrentPage('home')} className="hover:text-blue-500 transition-colors">Home</button>
                    <button onClick={() => setCurrentPage('explore')} className="hover:text-blue-500 transition-colors">Explore Careers</button>
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center hover:text-blue-500 transition-colors"
                        >
                            Career Categories <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg z-20 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                                {MOCK_CATEGORIES.map(category => (
                                    <button
                                        key={category.name}
                                        onClick={() => {
                                            setCurrentPage('explore', null, 'field', category.name);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-500 hover:text-white rounded-md"
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* New Quiz Link */}
                    <button onClick={() => setCurrentPage('quiz')} className="hover:text-blue-500 transition-colors">Quiz</button>
                    <button onClick={() => setCurrentPage('about')} className="hover:text-blue-500 transition-colors">About</button>
                    <button onClick={() => setCurrentPage('contact')} className="hover:text-blue-500 transition-colors">Contact</button>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    {/* User Login/Logout Display for Desktop (Name Only) */}
                    {user ? (
                        <div className="flex items-center space-x-2">
                            {/* Clickable Profile/Dashboard Link */}
                            <button onClick={() => setCurrentPage('dashboard')} className="flex items-center space-x-2 text-sm font-semibold hover:text-blue-500 transition-colors">
                                <User className="w-5 h-5" />
                                <span>{user.displayName || user.email || 'Profile'}</span>
                            </button>
                            <button onClick={handleLoginLogout} className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleLoginLogout} className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                            <LogIn className="w-5 h-5" />
                            <span>Login</span>
                        </button>
                    )}
                </nav>
                {/* Mobile Menu */}
                <div className="md:hidden flex items-center space-x-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    {/* User Login/Logout Display for Mobile (Name Only - or just button for space) */}
                    {user ? (
                         <div className="flex items-center space-x-2">
                            <button onClick={() => setCurrentPage('dashboard')} className="p-2 rounded-full hover:bg-gray-700">
                                <User className="w-5 h-5" />
                            </button>
                            <button onClick={handleLoginLogout} className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleLoginLogout} className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                            <LogIn className="w-5 h-5" />
                        </button>
                    )}
                    {/* You might consider a full mobile menu here for categories/pages */}
                </div>
            </div>
        </header>
    );
};

// Footer Component
const Footer = () => {
    const { theme } = useContext(AppContext);
    return (
        <footer className={`py-8 px-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-600'} text-center`}>
            <div className="container mx-auto">
                <div className="flex justify-center space-x-6 mb-4">
                    <a href="#" className="hover:text-blue-500 transition-colors">Facebook</a>
                    <a href="#" className="hover:text-blue-500 transition-colors">Twitter</a>
                    <a href="https://www.linkedin.com/in/shikhar-kumar-8568a92a1/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">LinkedIn (Shikhar)</a>
                </div>
                <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-8 text-sm mb-4">
                    <button onClick={() => alert('Terms of Service: Look, we built this cool thing to help you. Don\'t break it, don\'t try to hack it, and don\'t be a jerk. Common sense, right? If you try anything shady, we reserve the right to wag our finger disapprovingly. And maybe call your mom. 😉')} className="hover:text-blue-500 transition-colors">Terms of Service</button>
                    <button onClick={() => alert('Privacy Policy: We collect as little as possible. Your quiz answers help our AI understand you, and your Google login is just for, well, logging in. We\'re not selling your data to space aliens or spamming your grandma. Pinky promise! 🤫')} className="hover:text-blue-500 transition-colors">Privacy Policy</button>
                    <a href="mailto:contact@careerreality.com" className="hover:text-blue-500 transition-colors">contact@careerreality.com</a>
                </div>
                <p>© {new Date().getFullYear()} Career Reality. All rights reserved.</p>
            </div>
        </footer>
    );
};

// Home Page Component
const HomeSection = () => {
    const { setCurrentPage, theme } = useContext(AppContext);
    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Hero Section */}
            <section className={`relative h-96 flex items-center justify-center text-center ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white`}>
                <div className="absolute inset-0 bg-black opacity-30"></div>
                <div className="relative z-10 p-4">
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
                        Experience Careers Before You Choose One.
                    </h2>
                    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                        POV-style videos to help students choose the right path based on real experiences.
                    </p>
                    <button
                        onClick={() => setCurrentPage('explore')}
                        className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full text-lg shadow-lg hover:bg-gray-200 transition-all transform hover:scale-105"
                    >
                        Explore Now
                    </button>
                </div>
            </section>

            {/* Problem & Solution Block */}
            <section className="py-16 px-6 container mx-auto max-w-4xl">
                <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
                    Navigating Your Future
                </h3>
                <div className="flex flex-col md:flex-row items-center md:space-x-12 space-y-8 md:space-y-0">
                    <div className="md:w-1/2 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="text-2xl font-semibold mb-4 text-red-500">The Problem</h4>
                        <p className="text-lg">
                            Many students feel lost when choosing a career path. They rely on limited information, often leading to choices they later regret. The reality of a job can be vastly different from popular perception.
                        </p>
                    </div>
                    <div className="md:w-1/2 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="text-2xl font-semibold mb-4 text-green-500">Our Solution</h4>
                        <p className="text-lg">
                            Career Reality provides authentic, first-person video experiences of professionals. See a "day in the life" to understand the true work-life balance, responsibilities, and challenges before you commit.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className={`py-16 px-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
                <div className="container mx-auto max-w-5xl text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-12">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} transform transition-transform hover:scale-105">
                            <div className="text-5xl font-extrabold text-blue-500 mb-4">1</div>
                            <h4 className="text-xl font-semibold mb-3">Watch POV Videos</h4>
                            <p>Dive into immersive "day-in-the-life" videos from various professionals.</p>
                        </div>
                        <div className="p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} transform transition-transform hover:scale-105">
                            <div className="text-5xl font-extrabold text-blue-500 mb-4">2</div>
                            <h4 className="text-xl font-semibold mb-3">Understand the Reality</h4>
                            <p>Gain insights into daily tasks, work-life balance, and typical challenges.</p>
                        </div>
                        <div className="p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} transform transition-transform hover:scale-105">
                            <div className="text-5xl font-extrabold text-blue-500 mb-4">3</div>
                            <h4 className="text-xl font-semibold mb-3">Choose Confidently</h4>
                            <p>Make informed decisions about your future career path, free from regrets.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Careers */}
            <section className="py-16 px-6 container mx-auto">
                <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">Featured Careers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {MOCK_CAREERS.slice(0, 4).map(career => (
                        <div key={career.id} className={`rounded-lg shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} transform transition-transform hover:scale-105`}>
                            <div className="relative w-full h-48 bg-gray-300 flex items-center justify-center">
                                <img
                                    src={`https://img.youtube.com/vi/${career.youtubeId}/mqdefault.jpg`} // Corrected YouTube thumbnail URL
                                    alt={career.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/480x270/cccccc/333333?text=Video+Thumbnail`; }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-4xl">
                                    <Youtube className="w-12 h-12" />
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="text-xl font-semibold mb-2">{career.title}</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{career.duration}</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{career.tagline}</p>
                                <button
                                    onClick={() => setCurrentPage('careerDetail', career.id)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                >
                                    Watch Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <button
                        onClick={() => setCurrentPage('explore')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-lg font-semibold"
                    >
                        View All Careers
                    </button>
                </div>
            </section>

            {/* Testimonials/Quotes Section */}
            <section className={`py-16 px-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
                <div className="container mx-auto max-w-4xl text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-12">What People Are Saying</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {MOCK_TESTIMONIALS.map((testimonial, index) => (
                            <div key={index} className={`p-6 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} flex flex-col items-center justify-center text-center`}>
                                <p className="text-lg italic mb-4">"{testimonial.quote}"</p>
                                <p className="font-semibold text-blue-500">- {testimonial.author}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

// Explore Careers Page Component
const ExploreCareers = ({ initialFilter }) => {
    const { setCurrentPage, theme } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterField, setFilterField] = useState(
        initialFilter && initialFilter.type === 'field' ? initialFilter.value : 'All'
    );
    const [filterTag, setFilterTag] = useState('All');
    const [sortBy, setSortBy] = useState('Popularity');

    useEffect(() => {
        if (initialFilter && initialFilter.type === 'field' && initialFilter.value !== filterField) {
            setFilterField(initialFilter.value);
            setSearchTerm('');
            setFilterTag('All');
            setSortBy('Popularity');
        } else if (!initialFilter || initialFilter.type === null) {
            if (filterField !== 'All') setFilterField('All');
            if (searchTerm !== '') setSearchTerm('');
            if (filterTag !== 'All') setFilterTag('All');
            if (sortBy !== 'Popularity') setSortBy('Popularity');
        }
    }, [initialFilter]);

    const allFields = ['All', ...new Set(MOCK_CAREERS.map(c => c.field))].sort();
    const allTags = ['All', ...new Set(MOCK_CAREERS.flatMap(c => c.tags))].sort();

    const filteredCareers = MOCK_CAREERS.filter(career => {
        const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesField = filterField === 'All' || career.field === filterField;
        const matchesTag = filterTag === 'All' || career.tags.includes(filterTag);
        return matchesSearch && matchesField && matchesTag;
    }).sort((a, b) => {
        if (sortBy === 'Recently Added') {
            return b.id.localeCompare(a.id);
        }
        return 0;
    });

    return (
        <div className={`min-h-screen py-8 px-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12">Explore Careers</h2>

                {/* Search and Filter/Sort */}
                <div className={`p-6 mb-10 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <input
                        type="text"
                        placeholder="Search by career name..."
                        className={`w-full p-3 mb-4 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="field-filter" className="block text-sm font-medium mb-2">Filter by Field:</label>
                            <select
                                id="field-filter"
                                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                                value={filterField}
                                onChange={(e) => setFilterField(e.target.value)}
                            >
                                {allFields.map(field => (
                                    <option key={field} value={field}>{field}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tag-filter" className="block text-sm font-medium mb-2">Filter by Tags:</label>
                            <select
                                id="tag-filter"
                                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                            >
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sort-by" className="block text-sm font-medium mb-2">Sort by:</label>
                            <select
                                id="sort-by"
                                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="Popularity">Popularity</option>
                                <option value="Recently Added">Recently Added</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Career Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredCareers.length > 0 ? (
                        filteredCareers.map(career => (
                            <div key={career.id} className={`rounded-lg shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} transform transition-transform hover:scale-105`}>
                                <div className="relative w-full h-48 bg-gray-300 flex items-center justify-center">
                                    <img
                                        src={`https://img.youtube.com/vi/${career.youtubeId}/mqdefault.jpg`} // Corrected YouTube thumbnail URL
                                        alt={career.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/480x270/cccccc/333333?text=Video+Thumbnail`; }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-4xl">
                                        <Youtube className="w-12 h-12" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{career.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{career.duration}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{career.tagline}</p>
                                    <button
                                        onClick={() => setCurrentPage('careerDetail', career.id)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        Watch Now
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-lg text-gray-600 dark:text-gray-400">No careers found matching your criteria.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Career Detail Page Component
const CareerDetail = ({ careerId }) => {
    const { theme, setCurrentPage } = useContext(AppContext);
    const career = MOCK_CAREERS.find(c => c.id === careerId);

    if (!career) {
        return (
            <div className={`min-h-screen py-8 px-6 text-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <h2 className="text-3xl font-bold mb-4">Career Not Found</h2>
                <p>The career you are looking for does not exist.</p>
                <button onClick={() => setCurrentPage('explore')} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    Back to Explore
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen py-8 px-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto max-w-5xl">
                <button onClick={() => setCurrentPage('explore')} className="flex items-center text-blue-500 hover:text-blue-700 mb-6 transition-colors">
                    <ChevronUp className="rotate-[-90deg] w-5 h-5 mr-2" /> Back to Explore
                </button>

                <div className={`p-6 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className="text-4xl font-bold mb-6 text-center">{career.title}</h2>

                    {/* YouTube Video Embed */}
                    <div className="aspect-video w-full rounded-lg overflow-hidden mb-8 shadow-lg">
                        <iframe
                            src={`https://www.youtube.com/embed/${career.youtubeId}`} // Corrected embed URL
                            title={career.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4">Description</h3>
                            <p className="text-lg mb-4">{career.description}</p>

                            <div className="mb-6">
                                <h4 className="text-xl font-semibold mb-2">Field:</h4>
                                <span className="inline-block bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-blue-700 dark:text-blue-100">
                                    {career.field}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xl font-semibold mb-2">Tags:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {career.tags.map(tag => (
                                        <span key={tag} className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm dark:bg-gray-700 dark:text-gray-200">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-semibold mb-4">Skills Required</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {career.skillsRequired.map((skill, index) => (
                                        <li key={index}>{skill}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <div className="mb-6">
                                <h3 className="text-2xl font-semibold mb-4">Daily Schedule Summary</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {career.dailySchedule.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-semibold mb-4">Pros</h3>
                                <ul className="list-disc list-inside text-green-500 space-y-2">
                                    {career.pros.map((pro, index) => (
                                        <li key={index}>{pro}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-semibold mb-4">Cons</h3>
                                <ul className="list-disc list-inside text-red-500 space-y-2">
                                    {career.cons.map((con, index) => (
                                        <li key={index}>{con}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Optional Button */}
                            <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors text-lg font-semibold mt-4">
                                Book a Session with a Career Counselor (Future Feature)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Login Page Component
const Login = () => {
    const { handleLoginLogout, theme, user, setCurrentPage } = useContext(AppContext);

    useEffect(() => {
        if (user) {
            setCurrentPage('home'); // Redirect to home if already logged in
        }
    }, [user, setCurrentPage]);

    return (
        <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className={`p-8 rounded-lg shadow-xl text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-3xl font-bold mb-6">Login to Career Reality</h2>
                <button
                    onClick={handleLoginLogout}
                    className="flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_of_Google_G_Suite.svg" alt="Google Logo" className="w-6 h-6" />
                    <span>Login with Google</span>
                </button>
            </div>
        </div>
    );
};

// About Page Component
const About = () => {
    const { theme } = useContext(AppContext);
    return (
        <div className={`min-h-screen py-8 px-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto max-w-4xl">
                <h2 className="text-4xl font-bold text-center mb-12">About Career Reality</h2>

                <div className={`p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} mb-8`}>
                    <h3 className="text-2xl font-semibold mb-4">What is Career Reality?</h3>
                    <p className="text-lg leading-relaxed">
                        Career Reality is an innovative platform designed to bridge the gap between career aspirations and real-world experiences for students aged 16-18. We understand that choosing a career is one of the most significant decisions in a young person's life, and often, this choice is made with limited understanding of the day-to-day realities of a profession.
                    </p>
                </div>

                <div className={`p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} mb-8`}>
                    <h3 className="text-2xl font-semibold mb-4">Why it was built</h3>
                    <p className="text-lg leading-relaxed">
                        The inspiration for Career Reality came from recognizing the widespread confusion and regret among students who enter fields that don't align with their expectations. Traditional career counseling often lacks the immersive, experiential component needed for a true "reality check." We built this platform to provide that missing piece.
                    </p>
                </div>

                <div className={`p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} mb-8`}>
                    <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
                    <p className="text-lg leading-relaxed">
                        Our mission is simple: To empower students to make informed, regret-free career choices. By offering authentic, POV-style videos showcasing the "day in the life" of professionals across diverse fields, we aim to give students a clear, unfiltered view of what a career truly entails, helping them align their passions with practical realities.
                    </p>
                </div>

                <div className={`p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className="text-2xl font-semibold mb-4">Founder's Note</h3>
                    <p className="text-lg leading-relaxed italic">
                        "I believe that every student deserves the chance to explore their future with clarity and confidence. Career Reality is my contribution to helping the next generation build fulfilling and meaningful careers."
                    </p>
                    <p className="text-right font-semibold mt-4">- SHIKHAR KUMAR</p>
                </div>
            </div>
        </div>
    );
};

// Contact Page Component
const Contact = () => {
    const { theme } = useContext(AppContext);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [statusMessage, setStatusMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would send this data to a backend (e.g., Firebase Firestore, email service)
        console.log('Contact Form Submitted:', formData);
        setStatusMessage('Your message has been sent! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' }); // Clear form
        setTimeout(() => setStatusMessage(''), 5000); // Clear message after 5 seconds
    };

    return (
        <div className={`min-h-screen py-8 px-6 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className={`container mx-auto max-w-md p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-4xl font-bold text-center mb-8">Contact Us</h2>
                {statusMessage && (
                    <div className="p-4 mb-4 text-center text-green-700 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-100">
                        {statusMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-lg font-medium mb-2">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-lg font-medium mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-lg font-medium mb-2">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="5"
                            className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
};

// Chatbot Component
const Chatbot = () => {
    const { theme, setShowChatbot } = useContext(AppContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatHistoryRef = useRef(null);

    // Scroll to bottom of chat
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            let chatHistory = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
            chatHistory.push({ role: "user", parts: [{ text: input }] });

            const payload = { contents: chatHistory };
            // Gemini API Key provided by user
            const apiKey = "AIzaSyDiri-grgDVaYqsDvKY7vCst75BwYDn17g";

            if (!apiKey) {
                setMessages(prev => [...prev, { role: 'model', text: 'Chatbot is not configured. Please add your Gemini API Key.' }]);
                setIsLoading(false);
                return;
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const botResponse = result.candidates[0].content.parts[0].text;
                setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I could not get a response. Please try again.' }]);
                console.error("Gemini API response structure unexpected:", result);
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'An error occurred while fetching response.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 z-50 w-80 md:w-96 h-96 rounded-lg shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'}`}>
            <div className={`flex justify-between items-center p-4 rounded-t-lg ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600'} text-white`}>
                <h3 className="text-lg font-semibold">CareerBot</h3>
                <button onClick={() => setShowChatbot(false)} className="p-1 rounded-full hover:bg-blue-800">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div ref={chatHistoryRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400">Ask me anything about careers!</p>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-3 p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-900 self-end ml-auto' : 'bg-gray-100 text-gray-900 self-start mr-auto'} ${theme === 'dark' ? (msg.role === 'user' ? 'bg-blue-900 text-white' : 'bg-gray-700 text-white') : ''}`}>
                        <p className="font-semibold text-sm mb-1">{msg.role === 'user' ? 'You' : 'CareerBot'}</p>
                        <p>{msg.text}</p>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center justify-center p-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-sm">Typing...</span>
                    </div>
                )}
            </div>
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex`}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    className={`flex-1 p-2 rounded-l-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

// --- NEW QUIZ COMPONENT ---
const QUIZ_QUESTIONS = [
    {
        id: 'q1',
        question: 'How do you prefer to solve problems?',
        type: 'radio',
        options: [
            { text: 'Logically and analytically', value: 'analytical' },
            { text: 'Creatively, thinking outside the box', value: 'creative' },
            { text: 'Collaboratively with a team', value: 'collaborative' },
            { text: 'Practically, with hands-on solutions', value: 'practical' },
        ],
        category: 'problemSolving'
    },
    {
        id: 'q2',
        question: 'What kind of work environment do you thrive in?',
        type: 'radio',
        options: [
            { text: 'Fast-paced and dynamic', value: 'dynamic' },
            { text: 'Structured and organized', value: 'structured' },
            { text: 'Flexible with autonomy', value: 'flexible' },
            { text: 'People-centric and interactive', value: 'interactive' },
        ],
        category: 'workEnvironment'
    },
    {
        id: 'q3',
        question: 'How important is helping others in your career?',
        type: 'slider',
        min: 1, max: 5, step: 1,
        labels: ['Not important', '', '', '', 'Very important'],
        category: 'helpingOthers'
    },
    {
        id: 'q4',
        question: 'Which school subjects do you enjoy most?',
        type: 'checkbox',
        options: [
            { text: 'Math', value: 'math' },
            { text: 'Science (Physics, Chemistry, Bio)', value: 'science' },
            { text: 'Arts and Design', value: 'arts' },
            { text: 'Literature and Writing', value: 'writing' },
            { text: 'History and Social Studies', value: 'history' },
            { text: 'Computer Science / IT', value: 'it' },
        ],
        category: 'subjectInterest'
    },
    {
        id: 'q5',
        question: 'How comfortable are you with public speaking and presentations?',
        type: 'slider',
        min: 1, max: 5, step: 1,
        labels: ['Very uncomfortable', '', '', '', 'Very comfortable'],
        category: 'publicSpeaking'
    },
    {
        id: 'q6',
        question: 'What motivates you most in a job?',
        type: 'radio',
        options: [
            { text: 'High salary and financial stability', value: 'salary' },
            { text: 'Making a positive impact on society', value: 'impact' },
            { text: 'Opportunities for creativity and innovation', value: 'creativity' },
            { text: 'Continuous learning and intellectual challenge', value: 'learning' },
        ],
        category: 'motivation'
    },
    {
        id: 'q7',
        question: 'How much do you enjoy working with technology and gadgets?',
        type: 'slider',
        min: 1, max: 5, step: 1,
        labels: ['Not at all', '', '', '', 'Very much'],
        category: 'techInterest'
    },
    {
        id: 'q8',
        question: 'Do you prefer working indoors or outdoors?',
        type: 'radio',
        options: [
            { text: 'Indoors (office, lab, studio)', value: 'indoors' },
            { text: 'Outdoors (field, nature, construction)', value: 'outdoors' },
            { text: 'Mix of both', value: 'mix' },
        ],
        category: 'locationPreference'
    },
    {
        id: 'q9',
        question: 'How important is work-life balance to you?',
        type: 'slider',
        min: 1, max: 5, step: 1,
        labels: ['Not important', '', '', '', 'Extremely important'],
        category: 'workLifeBalance'
    },
    {
        id: 'q10',
        question: 'Are you comfortable with repetitive tasks?',
        type: 'radio',
        options: [
            { text: 'Yes, if it leads to a clear outcome', value: 'comfortable_repetitive' },
            { text: 'No, I prefer variety', value: 'discomfortable_repetitive' },
        ],
        category: 'repetitiveTasks'
    },
    {
        id: 'q11',
        question: 'Do you enjoy leading projects or working as a team member?',
        type: 'radio',
        options: [
            { text: 'Leading projects', value: 'leader' },
            { text: 'Working as a team member', value: 'team_member' },
            { text: 'Both, depending on the situation', value: 'both' },
        ],
        category: 'leadership'
    },
    {
        id: 'q12',
        question: 'How do you handle pressure and deadlines?',
        type: 'radio',
        options: [
            { text: 'I thrive under pressure', value: 'thrive_pressure' },
            { text: 'I manage well, but prefer less pressure', value: 'manage_pressure' },
            { text: 'I find it very stressful', value: 'stressful_pressure' },
        ],
        category: 'pressureHandling'
    },
    {
        id: 'q13',
        question: 'What kind of impact do you want to have in your career?',
        type: 'radio',
        options: [
            { text: 'Solve complex technical problems', value: 'tech_impact' },
            { text: 'Create beautiful or innovative designs', value: 'design_impact' },
            { text: 'Help people directly (health, education)', value: 'people_impact' },
            { text: 'Influence business decisions and strategy', value: 'business_impact' },
        ],
        category: 'desiredImpact'
    },
    {
        id: 'q14',
        question: 'How much do you value continuous learning and adapting to new information?',
        type: 'slider',
        min: 1, max: 5, step: 1,
        labels: ['Not at all', '', '', '', 'Extremely high'],
        category: 'continuousLearning'
    },
    {
        id: 'q15',
        question: 'If you had to pick one, which skill would you most like to develop?',
        type: 'radio',
        options: [
            { text: 'Advanced coding/programming', value: 'coding_skill' },
            { text: 'Creative writing/storytelling', value: 'writing_skill' },
            { text: 'Negotiation/persuasion', value: 'negotiation_skill' },
            { text: 'Scientific research methods', value: 'research_skill' },
        ],
        category: 'skillDevelopment'
    },
];

const QuizPage = () => {
    const { theme, user, setCurrentPage } = useContext(AppContext);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [quizStatus, setQuizStatus] = useState('pending'); // 'pending', 'submitting', 'submitted', 'error'
    const [errorMessage, setErrorMessage] = useState('');

    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

    useEffect(() => {
        if (!user) {
            setCurrentPage('login'); // Redirect to login if not logged in
            return;
        }
        // Potentially load saved answers if a quiz was partially completed
        // This is a stretch goal, for now, quiz starts fresh
    }, [user, setCurrentPage]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleCheckboxChange = (questionId, optionValue, isChecked) => {
        setAnswers(prev => {
            const currentValues = prev[questionId] || [];
            if (isChecked) {
                return { ...prev, [questionId]: [...currentValues, optionValue] };
            } else {
                return { ...prev, [questionId]: currentValues.filter(val => val !== optionValue) };
            }
        });
    };

    const goToNextQuestion = () => {
        if (answers[currentQuestion.id] === undefined || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0 && currentQuestion.type === 'checkbox')) {
            setErrorMessage('Please answer the current question before proceeding.');
            return;
        }
        setErrorMessage('');
        if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPreviousQuestion = () => {
        setErrorMessage('');
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!user) {
            setErrorMessage('You must be logged in to submit the quiz.');
            return;
        }
        if (answers[currentQuestion.id] === undefined || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0 && currentQuestion.type === 'checkbox')) {
            setErrorMessage('Please answer the current question before submitting.');
            return;
        }

        setQuizStatus('submitting');
        setErrorMessage('');

        const localAppId = 'career-reality-local-app-id';
        const userRef = doc(firestoreDb, `artifacts/${localAppId}/users/${user.uid}/user_profiles`, user.uid);

        try {
            // Prepare quiz answers for AI
            const quizSummary = QUIZ_QUESTIONS.map(q => {
                let answerText = answers[q.id];
                if (q.type === 'radio') {
                    answerText = q.options.find(opt => opt.value === answers[q.id])?.text || answers[q.id];
                } else if (q.type === 'checkbox') {
                    answerText = (answers[q.id] || []).map(val => q.options.find(opt => opt.value === val)?.text || val).join(', ');
                }
                return `Question: ${q.question}\nAnswer: ${answerText}\nCategory: ${q.category}`;
            }).join('\n\n');

            const prompt = `Based on the following user quiz answers, provide personalized career recommendations, analysis of their strengths and areas for growth, and numerical data for charts. The output MUST be a JSON object ONLY, with the following structure. Do NOT include any introductory or concluding text outside the JSON.

JSON Structure:
{
  "recommendedCareers": [
    {
      "career": "Career Name",
      "matchScore": "Integer (0-100)",
      "reasoning": "Brief explanation why this career matches"
    }
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "areasForGrowth": ["Area 1", "Area 2"],
  "quizAnalysis": {
    "preferenceScores": {
      "analytical": "Float (0-5, e.g., 4.2)",
      "creative": "Float (0-5)",
      "collaborative": "Float (0-5)",
      "practical": "Float (0-5)",
      "techInterest": "Float (0-5)",
      "peopleInteraction": "Float (0-5)",
      "workLifeBalanceImportance": "Float (0-5)",
      "learningCuriosity": "Float (0-5)",
      "pressureTolerance": "Float (0-5)"
    },
    "generalComments": "Overall summary of the user's profile based on quiz answers."
  },
  "nextSteps": [
    "Step 1: Explore recommended careers further.",
    "Step 2: Develop identified areas for growth.",
    "Step 3: Consider informational interviews."
  ]
}

User Quiz Answers:\n\n${quizSummary}

Provide diverse recommendations, not limited to typical ones. If an answer is unclear, make a reasonable assumption. Ensure all fields in the JSON structure are populated.`;


            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "AIzaSyDiri-grgDVaYqsDvKY7vCst75BwYDn17g"; // Gemini API Key provided by user

            if (!apiKey) {
                throw new Error('Gemini API Key is not configured. Please add your key in App.js.');
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
            }

            const result = await response.json();
            console.log("Gemini Raw Response:", result);

            let aiRecommendations;
            try {
                // Gemini might return text, or text within a part
                const rawText = result.candidates[0].content.parts[0].text;
                // Attempt to parse JSON, handle potential Markdown backticks
                aiRecommendations = JSON.parse(rawText.replace(/```json\n|\n```/g, '').trim());
            } catch (jsonError) {
                console.error("Failed to parse AI response as JSON:", jsonError, "Raw Text:", result.candidates[0].content.parts[0].text);
                throw new Error("AI response was not in expected JSON format.");
            }

            console.log("Parsed AI Recommendations:", aiRecommendations);

            await setDoc(userRef, {
                quizAnswers: answers,
                aiRecommendations: aiRecommendations,
                quizCompletedAt: new Date().toISOString()
            }, { merge: true });

            setQuizStatus('submitted');
            setCurrentPage('dashboard'); // Redirect to dashboard after successful submission
        } catch (error) {
            console.error("Error submitting quiz or getting AI recommendations:", error);
            setErrorMessage(`Failed to get recommendations: ${error.message}. Please try again. Ensure your Gemini API Key is valid.`);
            setQuizStatus('error');
        } finally {
            setQuizStatus('pending'); // Reset for next attempt if error
        }
    };

    return (
        <div className={`min-h-screen py-8 px-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto max-w-2xl">
                <h2 className="text-4xl font-bold text-center mb-8">Personalized Career Quiz</h2>

                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{errorMessage}</span>
                    </div>
                )}

                <div className={`p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className="text-2xl font-semibold mb-6">Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</h3>
                    <p className="text-xl mb-6">{currentQuestion.question}</p>

                    {currentQuestion.type === 'radio' && (
                        <div className="space-y-4">
                            {currentQuestion.options.map(option => (
                                <label key={option.value} className="flex items-center text-lg cursor-pointer">
                                    <input
                                        type="radio"
                                        name={currentQuestion.id}
                                        value={option.value}
                                        checked={answers[currentQuestion.id] === option.value}
                                        onChange={() => handleAnswerChange(currentQuestion.id, option.value)}
                                        className="form-radio h-5 w-5 text-blue-600 dark:text-blue-400"
                                    />
                                    <span className="ml-3">{option.text}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'checkbox' && (
                        <div className="space-y-4">
                            {currentQuestion.options.map(option => (
                                <label key={option.value} className="flex items-center text-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name={currentQuestion.id}
                                        value={option.value}
                                        checked={(answers[currentQuestion.id] || []).includes(option.value)}
                                        onChange={(e) => handleCheckboxChange(currentQuestion.id, option.value, e.target.checked)}
                                        className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 rounded"
                                    />
                                    <span className="ml-3">{option.text}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'slider' && (
                        <div className="w-full">
                            <input
                                type="range"
                                min={currentQuestion.min}
                                max={currentQuestion.max}
                                step={currentQuestion.step}
                                value={answers[currentQuestion.id] || currentQuestion.min}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <div className="flex justify-between text-sm mt-2">
                                {currentQuestion.labels.map((label, i) => (
                                    <span key={i}>{label}</span>
                                ))}
                            </div>
                            <p className="text-center mt-3">Current value: {answers[currentQuestion.id] || currentQuestion.min}</p>
                        </div>
                    )}

                    <div className="flex justify-between mt-8">
                        {currentQuestionIndex > 0 && (
                            <button
                                onClick={goToPreviousQuestion}
                                className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                            >
                                Previous
                            </button>
                        )}
                        {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? (
                            <button
                                onClick={goToNextQuestion}
                                className={`px-6 py-3 ${answers[currentQuestion.id] !== undefined && !(Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0 && currentQuestion.type === 'checkbox') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-full transition-colors ml-auto`}
                                disabled={answers[currentQuestion.id] === undefined || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0 && currentQuestion.type === 'checkbox')}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmitQuiz}
                                className={`px-6 py-3 ${answers[currentQuestion.id] !== undefined && !(Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0 && currentQuestion.type === 'checkbox') ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-full transition-colors ml-auto`}
                                disabled={quizStatus === 'submitting' || answers[currentQuestion.id] === undefined || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0 && currentQuestion.type === 'checkbox')}
                            >
                                {quizStatus === 'submitting' ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW DASHBOARD COMPONENT ---
const DashboardPage = () => {
    const { theme, user, setCurrentPage } = useContext(AppContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUserData = useCallback(async () => {
        if (!user || !firestoreDb) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const localAppId = 'career-reality-local-app-id';
            const userRef = doc(firestoreDb, `artifacts/${localAppId}/users/${user.uid}/user_profiles`, user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                setUserData(docSnap.data());
            } else {
                setUserData(null); // No user data found
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to load your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchUserData();
        } else {
            setCurrentPage('login'); // This causes a page change
        }
    }, [user, setCurrentPage, fetchUserData]);

    if (!user) {
        return (
            <div className={`min-h-screen py-8 px-6 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <p className="text-xl">Please log in to view your dashboard.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <p className="ml-4 text-xl">Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen py-8 px-6 text-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <h2 className="text-3xl font-bold mb-4 text-red-500">Error Loading Dashboard</h2>
                <p>{error}</p>
                <button onClick={fetchUserData} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    Try Again
                </button>
            </div>
        );
    }

    const hasQuizData = userData && userData.aiRecommendations && userData.quizAnswers;
    const aiRecommendations = userData?.aiRecommendations;
    const preferenceScores = aiRecommendations?.quizAnalysis?.preferenceScores;
    const generalComments = aiRecommendations?.quizAnalysis?.generalComments;

    // Simple Bar Chart Component (Enhanced)
    const PreferenceBarChart = ({ data, theme }) => {
        if (!data || Object.keys(data).length === 0) return (
            <p className="text-center text-gray-600 dark:text-gray-400">No preference data available for charting.</p>
        );

        const maxScore = 5; // Max score for each preference

        const friendlyLabels = {
            analytical: "Analytical Thinking",
            creative: "Creativity",
            collaborative: "Collaboration",
            practical: "Practical Skills",
            techInterest: "Tech Interest",
            peopleInteraction: "People Interaction",
            workLifeBalanceImportance: "Work-Life Balance Importance",
            learningCuriosity: "Learning Curiosity",
            pressureTolerance: "Pressure Tolerance",
        };

        const colors = [
            '#4A90E2', '#50E3C2', '#F5A623', '#BD10E0', '#7ED321',
            '#4A4A4A', '#F8E71C', '#8B572A', '#9B9B9B'
        ];

        return (
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} shadow-inner`}>
                <h4 className="text-xl font-semibold mb-6 text-center">Your Preference Profile</h4>
                <div className="space-y-5">
                    {Object.entries(data).map(([key, value], index) => (
                        <div key={key} className="flex flex-col">
                            <div className="flex justify-between items-end mb-1">
                                <span className="font-medium text-base md:text-lg text-gray-700 dark:text-gray-200">
                                    {friendlyLabels[key] || key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="font-bold text-lg text-blue-600 dark:text-blue-300">{value.toFixed(1)} / {maxScore.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-300 rounded-full h-3 dark:bg-gray-600 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${(value / maxScore) * 100}%`,
                                        backgroundColor: colors[index % colors.length]
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Note about Pie Chart (Conceptual) */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 text-center">
                   
                </p>
            </div>
        );
    };

    return (
        <div className={`min-h-screen py-8 px-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-4xl font-bold text-center mb-12">
                    Welcome, {user.displayName || user.email || 'User'}!
                </h2>

                {!hasQuizData ? (
                    <div className={`p-8 rounded-lg shadow-xl text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className="text-3xl font-semibold mb-6">Unlock Your Personalized Career Path!</h3>
                        <p className="text-lg mb-8">
                            Take our quick quiz to get AI-powered career recommendations tailored just for you.
                        </p>
                        <button
                            onClick={() => setCurrentPage('quiz')}
                            className="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center mx-auto"
                        >
                            <BookOpen className="w-6 h-6 mr-3" /> Take the Quiz Now!
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className={`p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <h3 className="text-3xl font-bold mb-6 flex items-center">
                                <Award className="w-8 h-8 mr-3 text-yellow-500" /> Your Personalized Career Recommendations
                            </h3>
                            {aiRecommendations?.recommendedCareers?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {aiRecommendations.recommendedCareers.map((rec, index) => (
                                        <div key={index} className={`p-5 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} shadow-md`}>
                                            <h4 className="text-xl font-semibold mb-2 text-blue-500">{rec.career}</h4>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">Match Score: {rec.matchScore}%</p>
                                            <p className="text-gray-700 dark:text-gray-200">{rec.reasoning}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No specific career recommendations available yet. Try re-taking the quiz.</p>
                            )}
                        </div>

                        {/* Quiz Analysis / Charts */}
                        {preferenceScores && (
                            <div className={`p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className="text-3xl font-bold mb-6 flex items-center">
                                    <BarChart className="w-8 h-8 mr-3 text-green-500" /> Your Profile Analysis
                                </h3>
                                {generalComments && (
                                    <p className="text-lg mb-6 leading-relaxed italic border-l-4 border-blue-500 pl-4 py-2">
                                        "{generalComments}"
                                    </p>
                                )}
                                <PreferenceBarChart data={preferenceScores} theme={theme} />
                            </div>
                        )}

                        {/* Strengths & Areas for Growth */}
                        <div className={`p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} grid grid-cols-1 md:grid-cols-2 gap-8`}>
                            <div>
                                <h3 className="text-2xl font-semibold mb-4 flex items-center">
                                    <CheckCircle className="w-6 h-6 mr-2 text-purple-500" /> Your Strengths
                                </h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {aiRecommendations?.strengths?.length > 0 ? (
                                        aiRecommendations.strengths.map((s, i) => <li key={i}>{s}</li>)
                                    ) : (
                                        <li>No specific strengths identified yet.</li>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-4 flex items-center">
                                    <Lightbulb className="w-6 h-6 mr-2 text-orange-500" /> Areas for Growth
                                </h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {aiRecommendations?.areasForGrowth?.length > 0 ? (
                                        aiRecommendations.areasForGrowth.map((a, i) => <li key={i}>{a}</li>)
                                    ) : (
                                        <li>No specific areas for growth identified yet.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className={`p-8 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <h3 className="text-2xl font-semibold mb-4 flex items-center">
                                <TrendingUp className="w-6 h-6 mr-2 text-blue-500" /> Next Steps
                            </h3>
                            <ul className="list-disc list-inside space-y-2">
                                {aiRecommendations?.nextSteps?.length > 0 ? (
                                    aiRecommendations.nextSteps.map((step, i) => <li key={i}>{step}</li>)
                                ) : (
                                    <li>Re-take the quiz for more tailored advice.</li>
                                )}
                            </ul>
                        </div>

                        <div className="text-center mt-8">
                            <button
                                onClick={() => setCurrentPage('quiz')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-lg font-semibold"
                            >
                                Re-take Quiz for New Recommendations
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// Main App Component
const App = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [currentPage, setCurrentPage] = useState('home');
    const [currentCareerId, setCurrentCareerId] = useState(null);
    const [currentFilter, setCurrentFilter] = useState({ type: null, value: null });
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [showChatbot, setShowChatbot] = useState(false);

    // Firebase Auth Listener
    useEffect(() => {
        if (!firebaseAuth || !firestoreDb) {
            setIsAuthReady(true);
            return;
        }

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const localAppId = 'career-reality-local-app-id';
                    const userRef = doc(firestoreDb, `artifacts/${localAppId}/users/${currentUser.uid}/user_profiles`, currentUser.uid);
                    await setDoc(userRef, {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName || 'Anonymous User',
                        email: currentUser.email || 'N/A',
                        photoURL: currentUser.photoURL || '',
                        lastLogin: new Date().toISOString()
                    }, { merge: true });
                } catch (error) {
                    console.error("Error saving user profile to Firestore:", error);
                }
            } else {
                setUser(null);
                signInAnonymously(firebaseAuth).catch(error => {
                    console.error("Error signing in anonymously:", error);
                });
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    // FIX: Memoize handleSetCurrentPage to prevent unnecessary re-renders of child components
    const handleSetCurrentPage = useCallback((page, id = null, filterType = null, filterValue = null) => {
        setCurrentPage(page);
        setCurrentCareerId(id);
        setCurrentFilter({ type: filterType, value: filterValue });
    }, []); // Empty dependency array ensures this function is created only once

    // Render content based on currentPage state
    const renderPage = () => {
        if (!isAuthReady) {
            return (
                <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="ml-4 text-xl">Loading application...</p>
                </div>
            );
        }

        switch (currentPage) {
            case 'home':
                return <HomeSection />;
            case 'explore':
                return <ExploreCareers initialFilter={currentFilter} />;
            case 'careerDetail':
                return <CareerDetail careerId={currentCareerId} />;
            case 'login':
                return <Login />;
            case 'about':
                return <About />;
            case 'contact':
                return <Contact />;
            case 'quiz': // New Quiz page
                return <QuizPage />;
            case 'dashboard': // New Dashboard page
                return <DashboardPage />;
            default:
                return <HomeSection />;
        }
    };

    const handleLoginLogout = async () => {
        if (!firebaseAuth) {
            console.warn("Firebase Auth is not initialized. Cannot perform login/logout.");
            return;
        }

        if (user) {
            try {
                await signOut(firebaseAuth);
                console.log("User signed out.");
                handleSetCurrentPage('home'); // Use the memoized setter
            } catch (error) {
                console.error("Error signing out:", error);
            }
        } else {
            try {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(firebaseAuth, provider);
                console.log("User signed in with Google.");
                handleSetCurrentPage('home'); // Use the memoized setter
            } catch (error) {
                console.error("Error signing in with Google:", error);
                if (error.code === 'auth/popup-closed-by-user') {
                    alert("Google sign-in popup was closed. Please try again.");
                } else if (error.code === 'auth/cancelled-popup-request') {
                    alert("A login popup was already open. Please complete the previous login attempt.");
                } else if (error.code === 'auth/network-request-failed') {
                    alert("Network error. Please check your internet connection and try again.");
                } else {
                    alert(`Login failed: ${error.message}`);
                }
            }
        }
    };


    return (
        <AppContext.Provider value={{ theme, setTheme, user, setCurrentPage: handleSetCurrentPage, handleLoginLogout, showChatbot, setShowChatbot }}>
            <div className={`min-h-screen flex flex-col font-inter ${theme === 'dark' ? 'dark' : ''}`}>
                <Header />
                <main className="flex-1">
                    {renderPage()}
                </main>
                <Footer />
                {showChatbot && <Chatbot />}
                <button
                    onClick={() => setShowChatbot(!showChatbot)}
                    className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 p-4 rounded-full shadow-lg transition-all transform hover:scale-110 z-50
                        ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    aria-label="Toggle Chatbot"
                >
                    <MessageSquareText className="w-8 h-8" />
                </button>
            </div>
        </AppContext.Provider>
    );
};

export default App;