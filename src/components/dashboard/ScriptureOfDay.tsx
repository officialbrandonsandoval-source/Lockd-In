'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';

interface Scripture {
  text: string;
  reference: string;
}

const SCRIPTURES: Scripture[] = [
  {
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    reference: 'Jeremiah 29:11 (NIV)',
  },
  {
    text: 'I can do all this through him who gives me strength.',
    reference: 'Philippians 4:13 (NIV)',
  },
  {
    text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    reference: 'Joshua 1:9 (NIV)',
  },
  {
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    reference: 'Proverbs 3:5-6 (NIV)',
  },
  {
    text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    reference: 'Isaiah 40:31 (NIV)',
  },
  {
    text: 'Commit to the Lord whatever you do, and he will establish your plans.',
    reference: 'Proverbs 16:3 (NIV)',
  },
  {
    text: 'The Lord is my shepherd, I lack nothing.',
    reference: 'Psalm 23:1 (NIV)',
  },
  {
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    reference: 'Romans 8:28 (NIV)',
  },
  {
    text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    reference: 'Joshua 1:9 (NIV)',
  },
  {
    text: 'The righteous person may have many troubles, but the Lord delivers him from them all.',
    reference: 'Psalm 34:19 (NIV)',
  },
  {
    text: 'No weapon forged against you will prevail, and you will refute every tongue that accuses you.',
    reference: 'Isaiah 54:17 (NIV)',
  },
  {
    text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    reference: 'Matthew 6:33 (NIV)',
  },
  {
    text: 'The Lord himself goes before you and will be with you; he will never leave you nor forsake you. Do not be afraid; do not be discouraged.',
    reference: 'Deuteronomy 31:8 (NIV)',
  },
  {
    text: 'Not only so, but we also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope.',
    reference: 'Romans 5:3-4 (NIV)',
  },
  {
    text: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.',
    reference: '2 Timothy 1:7 (NIV)',
  },
  {
    text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
    reference: 'Colossians 3:23 (NIV)',
  },
  {
    text: 'Be on your guard; stand firm in the faith; be courageous; be strong.',
    reference: '1 Corinthians 16:13 (NIV)',
  },
  {
    text: 'As iron sharpens iron, so one person sharpens another.',
    reference: 'Proverbs 27:17 (NIV)',
  },
  {
    text: 'Blessed is the one who perseveres under trial because, having stood the test, that person will receive the crown of life that the Lord has promised to those who love him.',
    reference: 'James 1:12 (NIV)',
  },
  {
    text: 'He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?',
    reference: 'Micah 6:8 (NIV)',
  },
  {
    text: 'Teach us to number our days, that we may gain a heart of wisdom.',
    reference: 'Psalm 90:12 (NIV)',
  },
  {
    text: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
    reference: 'Proverbs 21:5 (NIV)',
  },
  {
    text: 'Fathers, do not exasperate your children; instead, bring them up in the training and instruction of the Lord.',
    reference: 'Ephesians 6:4 (NIV)',
  },
  {
    text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
    reference: 'Galatians 5:22-23 (NIV)',
  },
  {
    text: 'Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us.',
    reference: 'Hebrews 12:1 (NIV)',
  },
  {
    text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
    reference: 'Romans 12:2 (NIV)',
  },
  {
    text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
    reference: 'Psalm 34:18 (NIV)',
  },
  {
    text: 'Delight yourself in the Lord, and he will give you the desires of your heart.',
    reference: 'Psalm 37:4 (NIV)',
  },
  {
    text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.',
    reference: 'Galatians 6:9 (NIV)',
  },
  {
    text: 'Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.',
    reference: 'Philippians 1:6 (NIV)',
  },
  {
    text: 'Above all else, guard your heart, for everything you do flows from it.',
    reference: 'Proverbs 4:23 (NIV)',
  },
  {
    text: 'The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.',
    reference: 'Proverbs 9:10 (NIV)',
  },
  {
    text: 'He gives strength to the weary and increases the power of the weak.',
    reference: 'Isaiah 40:29 (NIV)',
  },
  {
    text: 'For where your treasure is, there your heart will be also.',
    reference: 'Matthew 6:21 (NIV)',
  },
  {
    text: 'Therefore encourage one another and build each other up, just as in fact you are doing.',
    reference: '1 Thessalonians 5:11 (NIV)',
  },
];

function getScriptureForToday(): Scripture {
  const now = new Date();
  // Use year + month + day to generate a stable daily index
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const index = daysSinceEpoch % SCRIPTURES.length;
  return SCRIPTURES[index];
}

export default function ScriptureOfDay() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const scripture = useMemo(() => getScriptureForToday(), []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Subtle gold accent line at top */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />

      {/* Label */}
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-4 h-4 text-[#C9A84C]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="text-xs text-[#8A8578] font-sans uppercase tracking-widest">
          Scripture of the Day
        </span>
      </div>

      {/* Scripture text */}
      <motion.blockquote
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-4"
      >
        <p className="font-display text-[#E8E0D0] text-base leading-relaxed italic">
          &ldquo;{scripture.text}&rdquo;
        </p>
      </motion.blockquote>

      {/* Reference */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-sm text-[#C9A84C]/80 font-sans font-medium"
      >
        -- {scripture.reference}
      </motion.p>
    </motion.div>
  );
}
