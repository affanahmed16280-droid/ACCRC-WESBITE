'use client';

import { useEffect, useMemo, useState } from 'react';
import { Award, GraduationCap, IdCard, Medal, Trophy, UsersRound } from 'lucide-react';
import { subscribeToAchievements, type FirestoreAchievement } from '@/lib/firestore';
import styles from './AchievementsAndPanels.module.css';

type PanelKey = '2026' | '2025' | '2023' | 'founder';
type AwardLevel = 'Global' | 'National';

type Achievement = {
  title: string;
  recipients: string;
  competition: string;
  level: AwardLevel;
  year: number;
};

type ExecutiveMember = {
  name: string;
  designation: string;
  collegeId?: string;
  imageUrl?: string;
  imageFrame?: 'portrait' | 'square' | 'wide';
};

type PanelData = {
  label: string;
  eyebrow: string;
  description: string;
  achievements: Achievement[];
  executive_panel: ExecutiveMember[];
  moderators?: ExecutiveMember[];
};

/*
 * Update this object as new results and committee members are confirmed. The
 * achievement filter below uses the actual year stored on every record, so a
 * selected year never includes records from an earlier or later season.
 */
const panels: Record<PanelKey, PanelData> = {
  '2026': {
    label: 'Executive Committee 26',
    eyebrow: 'CURRENT LEADERSHIP',
    description: 'The committee leading ACCRC’s next season of building, learning, and competition.',
    achievements: [
      {
        title: 'Grand Prize / 1st Place',
        recipients: 'Masroor Ali Neil',
        competition: 'Teens Dream Changemakers Video Challenge 2026 — “Cochlea Cap” wearable assistive device',
        level: 'Global',
        year: 2026,
      },
    ],
    executive_panel: [
      {
        name: 'Masroor Ali Neil',
        designation: 'President',
        imageUrl: '/leadership/committee-26/photo_6170079490235634212_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Md. Shafayet Biswas',
        designation: 'General Secretary',
        imageUrl: '/leadership/committee-26/photo_6170079490235634213_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Fatema Tooz-Zohra Falguni',
        designation: 'Assistant General Secretary',
        imageUrl: '/leadership/committee-26/photo_6170079490235634214_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Md. Farhad Hossain',
        designation: 'Organizing Secretary',
        imageUrl: '/leadership/committee-26/photo_6170079490235634215_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Waqil Chowdhury Jim',
        designation: 'Administrative Secretary',
        imageUrl: '/leadership/committee-26/photo_6170079490235634216_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Aisha Tabassum Probha',
        designation: 'Joint Secretary',
        imageUrl: '/leadership/committee-26/photo_6170079490235634217_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Mahdi Al Rayan Bhuiyan',
        designation: 'Head of Event Management',
        imageUrl: '/leadership/committee-26/photo_6170079490235634218_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Shahria Ahmed Arafat',
        designation: 'Vice President (Project)',
        imageUrl: '/leadership/committee-26/photo_6170079490235634219_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Nusrat Jahan',
        designation: 'Vice President (IT)',
        imageUrl: '/leadership/committee-26/photo_6170079490235634220_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Ayman Ibna Amir',
        designation: 'Vice President (Creative Works)',
        imageUrl: '/leadership/committee-26/photo_6170079490235634221_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Mst. Sraboni Akter Mimi',
        designation: 'Vice President (Publication)',
        imageUrl: '/leadership/committee-26/photo_6170079490235634222_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Azim Saikat Hassan Sagor',
        designation: 'Secretary of IT',
        imageUrl: '/leadership/committee-26/photo_6170079490235634223_y.jpg',
        imageFrame: 'square',
      },
      {
        name: 'Mukaddim Rahman',
        designation: 'Secretary of Creative Works',
        imageUrl: '/leadership/committee-26/photo_6170079490235634224_y.jpg',
        imageFrame: 'square',
      },
    ],
    moderators: [
      {
        name: 'Naimul Haque Naim',
        designation: 'Moderator',
        imageUrl: '/leadership/moderator-naimul-haque-naim.png',
        imageFrame: 'wide',
      },
      {
        name: 'Prof. Md. Abdul Halim',
        designation: 'Co-Moderator',
        imageUrl: '/leadership/moderator-md-abdul-halim.jpg',
        imageFrame: 'portrait',
      },
    ],
  },
  '2025': {
    label: "Advisor Panel / EC'25",
    eyebrow: 'LEADERSHIP ARCHIVE',
    description: 'A record of the EC’25 leadership team and the club’s national and international recognition.',
    achievements: [
      {
        title: 'Individual Gold Medal',
        recipients: 'Taseen Mohammad',
        competition: 'International Olympiad on Climate Change and Environmental Issues (IOCE 2025), Russia',
        level: 'Global',
        year: 2025,
      },
      {
        title: 'Outstanding Presentation Award',
        recipients: 'Team Bangladesh — Taseen Mohammad, Mahdi Bin Ferdaus, Md Ashikur Rahman, Md Nur Ahmed',
        competition: 'International Olympiad on Climate Change and Environmental Issues (IOCE 2025), Russia',
        level: 'Global',
        year: 2025,
      },
      {
        title: 'Paper of the Year',
        recipients: 'Jawad Zaman',
        competition: 'Northeast Regional Honors Conference 2025 — AI-driven machine translation research',
        level: 'Global',
        year: 2025,
      },
      {
        title: 'Bangladesh Representative',
        recipients: 'Anas Bin Azam',
        competition: 'World Robot Olympiad 2025, Philippines — 160 teams from 25 nations',
        level: 'Global',
        year: 2025,
      },
      {
        title: 'Gold Medal & National Team Selection',
        recipients: 'ACCRC Sub-Executive',
        competition: 'World Robot Olympiad National Round and International Finals, Turkey',
        level: 'Global',
        year: 2025,
      },
      {
        title: 'Champion — Project Presentation',
        recipients: 'Md. Juglul Karim and Shahria Ahmed Arafat',
        competition: 'MIE 1.0 Robolution, CUET',
        level: 'National',
        year: 2025,
      },
      {
        title: 'Champion — Project Display (Mechanical)',
        recipients: 'Md. Shafayet Biswas and Sabit Islam Efty',
        competition: '16th DRMC National Science Carnival 2025',
        level: 'National',
        year: 2025,
      },
      {
        title: 'Champion — Research Article Contest',
        recipients: 'Masroor Ali Neil',
        competition: 'Innoverse National Science & Technology Carnival 2025, BUET',
        level: 'National',
        year: 2025,
      },
      {
        title: '1st Place — Robo Display',
        recipients: 'Md. Shafayet Biswas',
        competition: 'Technovation 2025, Josephite IT Club',
        level: 'National',
        year: 2025,
      },
      {
        title: '3rd Place / Special Award',
        recipients: 'Md. Shafayet Biswas',
        competition: '46th National Science & Technology Week',
        level: 'National',
        year: 2025,
      },
      {
        title: '1st Runner-Up — Project Display',
        recipients: 'Shahria Ahmed Arafat and Md. Juglul Karim',
        competition: 'Rajuk National Scipark 3.0',
        level: 'National',
        year: 2025,
      },
      {
        title: '11th Place — Divisional Round',
        recipients: 'Taufiq Mustafizur Rahman',
        competition: 'Bangladesh Physics Olympiad (BDPhO)',
        level: 'National',
        year: 2025,
      },
      {
        title: 'Champion — Robotics Project',
        recipients: 'Sayeed Un Nur Shoaib and Arafat Zaman Sajid',
        competition: 'Shahid Bir Uttam Lt. Anwar’s Girls College Mega Science Festival',
        level: 'National',
        year: 2025,
      },
      {
        title: 'Champion — Extempore Speech',
        recipients: 'Muhammad Andalib',
        competition: 'Shahid Bir Uttam Lt. Anwar’s Girls College Mega Science Festival',
        level: 'National',
        year: 2025,
      },
      {
        title: 'Runner-Up — Wall Magazine',
        recipients: 'Ta-Sin Mahmud and Hafsa Islam Ohi',
        competition: 'Shahid Bir Uttam Lt. Anwar’s Girls College Mega Science Festival',
        level: 'National',
        year: 2025,
      },
      {
        title: 'Champion — Wall Magazine',
        recipients: 'The Renaissance — Zahinur Rahman, DM Abrar Mead, Sabrina Mustari',
        competition: 'BAF Shaheen 6th Language Summit',
        level: 'National',
        year: 2025,
      },
      {
        title: '2nd Runner-Up — Wall Magazine',
        recipients: 'Revolution of Fantasy',
        competition: 'BAF Shaheen 6th Language Summit',
        level: 'National',
        year: 2025,
      },
      {
        title: 'Lieutenant Commissioning',
        recipients: 'Tannur Jubaer Swachya (Batch 52)',
        competition: 'Bangladesh Military Academy',
        level: 'National',
        year: 2025,
      },
      {
        title: 'Green Card — 95th BMA Long Course',
        recipients: 'Faisal Ahmed Adit',
        competition: 'Bangladesh Military Academy',
        level: 'National',
        year: 2025,
      },
      {
        title: 'Green Card — 93rd BMA Long Course',
        recipients: 'Md. Zahinur Rahman',
        competition: 'Bangladesh Military Academy',
        level: 'National',
        year: 2025,
      },
      {
        title: 'ISSB Qualification',
        recipients: 'DM Abrar Mead',
        competition: 'Inter Services Selection Board (ISSB)',
        level: 'National',
        year: 2025,
      },
      {
        title: 'National Finalist',
        recipients: 'Abrar Galib and Danesh Rafin',
        competition: 'Bangladesh Stockholm Junior Water Prize 2023',
        level: 'National',
        year: 2023,
      },
      {
        title: 'Silver Award',
        recipients: 'Abrar Galib Ohe',
        competition: 'The Queen’s Commonwealth Essay Competition 2023',
        level: 'Global',
        year: 2023,
      },
      {
        title: 'Sole Delegate from Bangladesh',
        recipients: 'Fatematuj Johra Rani',
        competition: 'International Human Rights Program',
        level: 'Global',
        year: 2023,
      },
      {
        title: 'Institutional Recognition',
        recipients: 'ACCRC members',
        competition: 'Humanoid Robot and Nano-Satellite projects — recognised by the College Principal',
        level: 'National',
        year: 2025,
      },
    ],
    executive_panel: [
      {
        name: 'Sayeed Un Nur Shoaib',
        designation: "President'25",
        collegeId: '100002399',
      },
      {
        name: 'Mirza Tamzid Hasan',
        designation: "General Secretary'25",
        collegeId: '100002400',
      },
      {
        name: 'Halima Tus Shadia',
        designation: "Administrative Secretary'25",
        collegeId: '100002401',
      },
      {
        name: 'Mohine Rana Soria',
        designation: "VP of Publications'25",
        collegeId: '100002402',
      },
      {
        name: 'DM Abrar Mead',
        designation: "President'24",
        collegeId: '100002403',
      },
      {
        name: 'Sabrina Mustari',
        designation: "Organizing Secretary'24",
        collegeId: '100002404',
      },
    ],
  },
  '2023': {
    label: 'Achievements Archive 2023',
    eyebrow: 'RECOGNITION ARCHIVE',
    description: 'Awards and recognition recorded during the 2023 season.',
    achievements: [],
    executive_panel: [],
  },
  founder: {
    label: 'Founder Panel',
    eyebrow: 'OUR BEGINNING',
    description: 'The founding team that established the club’s culture of building, learning, and competing together.',
    achievements: [],
    executive_panel: [
      {
        name: 'Muedul Hasan Methun',
        designation: 'Founder & President',
        collegeId: 'Founding Team',
        imageUrl: '/leadership/muedul-hasan-methun.png',
        imageFrame: 'portrait',
      },
      {
        name: 'Ahmad Zaim Khan',
        designation: 'Co-Founder & General Secretary',
        collegeId: 'Founding Team',
        imageUrl: '/leadership/ahmad-zaim-khan.png',
        imageFrame: 'portrait',
      },
      {
        name: 'Shibil Rahman',
        designation: 'Co-Founder & Vice President (Admin)',
        collegeId: 'Founding Team',
        imageUrl: '/leadership/shibil-rahman.png',
        imageFrame: 'portrait',
      },
    ],
  },
};

const allAchievements = Object.values(panels).flatMap((panel) => panel.achievements);

const tabs: { key: PanelKey; label: string }[] = [
  { key: '2026', label: '2026' },
  { key: '2025', label: '2025' },
  { key: '2023', label: '2023' },
  { key: 'founder', label: 'Founder Panel' },
];

export function AchievementsAndPanels() {
  const [activeTab, setActiveTab] = useState<PanelKey>('2026');
  const [adminAchievements, setAdminAchievements] = useState<FirestoreAchievement[]>([]);
  const activePanel = panels[activeTab];

  useEffect(() => {
    return subscribeToAchievements(setAdminAchievements, (error) => {
      // Historical achievements remain available if the live content service is unavailable.
      console.error('Unable to load live achievements.', error);
    });
  }, []);

  const achievements = useMemo(() => {
    if (activeTab === 'founder') return activePanel.achievements;

    return [...allAchievements, ...adminAchievements]
      .filter((achievement) => achievement.year === Number(activeTab))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [activePanel.achievements, activeTab, adminAchievements]);

  return (
    <section className={styles.section} id="achievements" aria-labelledby="achievements-title">
      <div className={styles.wrap}>
        <div className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>RECOGNITION / LEADERSHIP</p>
            <h2 id="achievements-title">Achievements &amp; <span>Executive Panels.</span></h2>
          </div>
          <p className={styles.introCopy}>
            A growing record of the people, projects, and results that represent ACCRC.
          </p>
        </div>

        <div className={styles.tabList} role="tablist" aria-label="Achievements and executive panel by year">
          {tabs.map((tab) => (
            <button
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
              id={`achievements-tab-${tab.key}`}
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.key}
              aria-controls="achievements-panel"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className={styles.panel}
          id="achievements-panel"
          key={activeTab}
          role="tabpanel"
          aria-labelledby={`achievements-tab-${activeTab}`}
        >
          <div className={styles.panelIntro}>
            <div>
              <p className={styles.eyebrow}>{activePanel.eyebrow}</p>
              <h3>{activePanel.label}</h3>
            </div>
            <p>{activePanel.description}</p>
          </div>

          <div className={styles.contentDivider} />

          {activeTab !== 'founder' && (
            <>
              <div className={styles.contentHeading}>
                <div>
                  <Trophy aria-hidden="true" />
                  <h4>Achievements</h4>
                </div>
                <span>{achievements.length} published</span>
              </div>

              {achievements.length > 0 ? (
                <div className={styles.achievementGrid}>
                  {achievements.map((achievement, index) => (
                    <article className={styles.achievementCard} key={`${achievement.title}-${achievement.recipients}`}>
                      <div className={styles.awardIcon} aria-hidden="true">
                        {index % 2 === 0 ? <Trophy /> : <Medal />}
                      </div>
                      <div className={styles.achievementBody}>
                        <div className={styles.cardMeta}>
                          <span className={achievement.level === 'Global' ? styles.global : styles.national}>{achievement.level}</span>
                          <time dateTime={String(achievement.year)}>{achievement.year}</time>
                        </div>
                        <h5>{achievement.title}</h5>
                        <p className={styles.recipients}>{achievement.recipients}</p>
                        <p className={styles.competition}>{achievement.competition}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState label="achievement records" />
              )}
            </>
          )}

          {activePanel.executive_panel.length > 0 && (
            <>
              {activePanel.moderators && activePanel.moderators.length > 0 && (
                <>
                  <div className={`${styles.contentHeading} ${styles.executiveHeading}`}>
                    <div>
                      <GraduationCap aria-hidden="true" />
                      <h4>Advisor &amp; Moderation Panel</h4>
                    </div>
                    <span>{activePanel.moderators.length} members</span>
                  </div>
                  <MemberGrid members={activePanel.moderators} className={styles.moderatorGrid} />
                </>
              )}
              <div className={`${styles.contentHeading} ${styles.executiveHeading}`}>
                <div>
                  <UsersRound aria-hidden="true" />
                  <h4>{activeTab === 'founder' ? 'Founding Team' : 'Executive Panel'}</h4>
                </div>
                <span>{activePanel.executive_panel.length} members</span>
              </div>
              <MemberGrid
                members={activePanel.executive_panel}
                className={activeTab === 'founder' ? styles.founderGrid : undefined}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function MemberGrid({ members, className = '' }: { members: ExecutiveMember[]; className?: string }) {
  return (
    <div className={`${styles.memberGrid} ${className}`}>
      {members.map((member) => {
        const framed = Boolean(member.imageUrl && member.imageFrame);
        const imageClass = member.imageFrame === 'portrait'
          ? styles.portraitFrame
          : member.imageFrame === 'wide'
            ? styles.wideFrame
            : member.imageFrame === 'square'
              ? styles.squareFrame
              : '';

        return (
          <article
            className={`${styles.memberCard} ${framed ? styles.framedCard : ''}`}
            key={member.name}
            aria-label={`${member.name}, ${member.designation}`}
          >
            {member.imageUrl ? (
              <img className={`${styles.avatar} ${imageClass}`} src={member.imageUrl} alt={`${member.name}, ${member.designation}`} />
            ) : (
              <div className={styles.avatarFallback} aria-label={`Photo to be added for ${member.name}`}>
                {member.name.split(' ').map((part) => part[0]).join('').slice(0, 3)}
              </div>
            )}
            <div className={styles.memberInfo}>
              <p className={styles.memberRole}>{member.designation}</p>
              <h5>{member.name}</h5>
              {member.collegeId && (
                <p className={styles.memberId}><IdCard size={14} aria-hidden="true" /> College ID: {member.collegeId}</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className={styles.emptyState}>
      <Award aria-hidden="true" />
      <p>No {label} published yet.</p>
    </div>
  );
}
