'use strict';

// Editorial content only. Product coverage, prices and installation steps belong in the store.
const sources = {
  appleTravel: { title: 'Apple: using an eSIM when traveling internationally', url: 'https://support.apple.com/en-us/118227' },
  samsungEsim: { title: 'Samsung: Galaxy eSIM support and regional differences', url: 'https://www.samsung.com/ca/support/mobile-devices/galaxy-esim-and-supported-network-carriers/' },
  fccCoverage: { title: 'FCC: what the National Broadband Map shows', url: 'https://help.bdc.fcc.gov/hc/en-us/articles/10467446103579-How-to-Use-the-FCC-s-National-Broadband-Map' },
  onboard: { title: 'Inmarsat: onboard connectivity using satellite and terrestrial networks', url: 'https://www.inmarsat.com/news/latest-news/maritime/2023/inmarsat-maritime-launches-fleet-reach-bringing-seamless-connectivity-to-ships-from-sea-to-port/' },
  inspection: { title: 'TIC Council: Petroleum Inspector Certification Programme', url: 'https://www.tic-council.org/ifia-certification-programme/petroleum-inspector-certification-programme' }
};

module.exports = [
  {
    slug: 'crew-change-connectivity',
    category: 'Crew Change & Travel',
    title: 'How to prepare connectivity for a three-airport crew change',
    summary: 'Departure, a connection and arrival: prepare country coverage, contact handovers and an offline fallback for each stage.',
    readTime: '4 min read',
    dateModified: '2026-09-12',
    sections: [
      {
        heading: 'Write down the journey before choosing the plan.',
        paragraphs: [
          'A joining journey might run from home to a departure airport, through a connecting airport in another country, then on to an arrival airport, hotel and port. The country where the vessel is waiting is only one part of that route.',
          'Make a short itinerary with each country, the local arrival date and the person expecting your next update. Include an overnight connection or possible hotel stop. Check each country against the selected plan; a regional name alone is not a coverage list.'
        ]
      },
      {
        heading: 'Give each airport a specific check.',
        list: [
          'Departure airport: keep the itinerary, joining instructions and agent contact offline. Confirm the phone is ready before the last reliable connection disappears.',
          'Connecting airport: check onward flight information and send an update if the connection changes. Agree beforehand how long to wait before the coordinator follows up when you cannot get online.',
          'Arrival airport: confirm the meeting point, pickup contact and next destination. Read the latest instructions before leaving the terminal; an old screenshot may describe a superseded pickup.'
        ]
      },
      {
        heading: 'Separate mobile data from your contact number.',
        paragraphs: [
          'Decide whether the coordinator will use an internet messaging app, an ordinary call or SMS. A data-only eSIM does not supply ordinary voice calls or SMS. Confirm that the chosen plan supports the communication you need.',
          'If you keep a home line active as well, review its roaming terms and select the intended data line. A travel data plan does not remove charges that may arise on the home line.'
        ],
        sources: [sources.appleTravel]
      },
      {
        heading: 'Check validity against delays, not just the flight time.',
        paragraphs: [
          'Read the purchase instructions to find out what starts the validity period: installation, activation or a first supported network connection. Follow the rule for that specific plan. Allow for the actual journey dates, including a connection that crosses midnight or a delayed vessel arrival.',
          'Install when instructed and while a dependable connection is available. Keep the order reference and support instructions accessible without relying on the travel data you are trying to set up.'
        ]
      },
      {
        heading: 'For the person coordinating the rotation',
        paragraphs: [
          'Share one current set of instructions, a named contact and an agreed fallback if an update does not arrive. Ask crew to complete device checks before departure. A group connectivity requirement starts with destinations, travel dates and the number of people; confirm purchasing and distribution arrangements with Amicus before promising them to crew.'
        ]
      }
    ],
    callout: { heading: 'Connectivity supports the handover.', text: 'A working phone or an application entry does not confirm a transfer. The responsible agent or coordinator still needs to confirm the pickup and local arrangements.' },
    primaryCta: { siteKey: 'shopUrl', label: 'Check plans for your journey' },
    secondaryCta: { href: '/solutions/crew-change', label: 'Explore Crew Change' },
    nextStep: 'Check the itinerary against current plan coverage, or read how the Crew Change tool fits into preparation.',
    relatedSlugs: ['esim-before-you-travel', 'vessel-to-home-connectivity']
  },
  {
    slug: 'esim-before-you-travel',
    category: 'Crew Connectivity',
    title: 'Before boarding: check the phone, the eSIM and the backup',
    summary: 'Check the exact handset, plan conditions and contact method before a port call or crew-change journey depends on them.',
    readTime: '3 min read',
    dateModified: '2026-09-12',
    sections: [
      {
        heading: 'Check the handset in your hand.',
        paragraphs: [
          'Record the exact model and the country where it was sold. A familiar model name does not guarantee eSIM support: Samsung notes that support can differ by country of origin. Check the manufacturer guidance for that device and the requirements of the selected plan.',
          'Check the carrier lock separately. Apple requires an unlocked iPhone when using another carrier abroad. Resolve a lock with the original carrier before buying a separate travel plan.'
        ],
        sources: [sources.samsungEsim, sources.appleTravel]
      },
      {
        heading: 'Read five details before paying.',
        list: [
          'Countries: include any transit country where you want to use mobile data.',
          'Validity: identify the event that starts the clock and compare the duration with your travel dates.',
          'Allowance: check the data amount and any stated limits or speed conditions.',
          'Contact method: confirm whether the plan is data-only or also includes ordinary calls and SMS.',
          'Setup: read the installation, activation and support instructions for that plan.'
        ]
      },
      {
        heading: 'Prepare a fallback that works offline.',
        paragraphs: [
          'Save the current joining instructions, hotel address, pickup point and agent telephone number locally. Include the international dialing code. Keep a copy of your itinerary and order reference where you can reach them without opening a web page.',
          'Agree how to report a delay if your usual messaging app is unavailable. A backup contact is useful only if you know which method can reach them.'
        ]
      },
      {
        heading: 'If data does not work after landing',
        paragraphs: [
          'Use the store support instructions in order: confirm the destination is covered, the plan is valid, and the intended line is selected for data. Check the roaming setting required for that travel line. Review the home line separately so that changing one setting does not create unintended use on the other.',
          'If the problem remains, contact support using an available connection. Give the order reference, exact phone model, country and the error shown. Follow support guidance before deleting the eSIM; do not assume it can be installed again.'
        ]
      }
    ],
    callout: { heading: 'Use the instructions for your purchase.', text: 'Device menus and plan activation rules differ. The store help pages and the instructions supplied with the plan are the place for current setup details.' },
    primaryCta: { siteKey: 'installationUrl', label: 'Read installation guidance' },
    secondaryCta: { siteKey: 'shopUrl', label: 'Explore eSIM plans' },
    nextStep: 'Finish device and setup checks before choosing a plan for the countries on your itinerary.',
    relatedSlugs: ['crew-change-connectivity', 'vessel-to-home-connectivity']
  },
  {
    slug: 'vessel-to-home-connectivity',
    category: 'Crew Connectivity',
    title: 'From vessel to home: where your connection changes',
    summary: 'Onboard Wi-Fi, anchorage, port, airport and home use different connections. Know what to check at each handover.',
    readTime: '3 min read',
    dateModified: '2026-09-12',
    sections: [
      {
        heading: 'On the vessel: identify what carries the connection.',
        paragraphs: [
          'Shipboard Wi-Fi is a way to reach the vessel\'s network; its internet connection may use a separate satellite or shore-based service. Onboard systems can combine those networks. Access, allowances and availability depend on the arrangement on that vessel.',
          'A travel eSIM for cellular data ashore is a separate product. Buying one does not buy access to the vessel\'s Wi-Fi or provide mid-ocean cellular coverage. Ask about onboard access before joining.'
        ],
        sources: [sources.onboard]
      },
      {
        heading: 'At anchorage: plan for a gap.',
        paragraphs: [
          'Seeing land does not confirm a usable connection. Check the selected plan\'s supported network and coverage, but do not make an essential handover depend on a signal at the anchorage or during the launch transfer.',
          'Before leaving a working connection, save the next meeting point and current instructions. Agree when the coordinator should expect the next update and what to do if it does not arrive.'
        ]
      },
      {
        heading: 'In port: country coverage is only the first check.',
        paragraphs: [
          'A country on the plan\'s list does not guarantee reception at a particular berth, inside a terminal or throughout the onward journey. For example, the FCC explains that its U.S. mobile coverage maps describe outdoor or in-vehicle service, not indoor coverage.',
          'Check the connection where you are permitted to use the phone, then send the arrival update before starting the next leg. Keep the local contact information offline even after the phone connects.'
        ],
        sources: [sources.fccCoverage]
      },
      {
        heading: 'At the airport: treat each country as a new check.',
        paragraphs: [
          'After a flight, confirm the intended data line and plan coverage before relying on messaging or navigation. Airport Wi-Fi may be another option, but have the onward flight and pickup details saved before you need it.',
          'For a connecting flight in a different country, repeat the check. Coverage at the departure and final airports does not establish coverage at the connection.'
        ]
      },
      {
        heading: 'At home: check which line is active.',
        paragraphs: [
          'Confirm that the home line and your preferred data line are active as intended. Review any travel line still enabled and keep the order details until any support issue is resolved. Follow the device and provider instructions when deciding whether to retain an eSIM for another journey.'
        ]
      }
    ],
    callout: { heading: 'Agree the next update before the connection changes.', text: 'Write down who expects to hear from you, by which method and at what stage. That makes a temporary loss of mobile data easier to handle during a crew change.' },
    primaryCta: { siteKey: 'shopUrl', label: 'Check cellular plan coverage' },
    secondaryCta: { href: '/contact?interest=Crew%20Connectivity', label: 'Discuss crew connectivity' },
    nextStep: 'Use the eSIM store for cellular plans covering travel and time ashore. Discuss recurring crew journeys with Amicus.',
    relatedSlugs: ['crew-change-connectivity', 'esim-before-you-travel']
  },
  {
    slug: 'maritime-tools',
    category: 'Port & Operational Tools',
    title: 'Crew coordination and inspection study: choose the right tool',
    summary: 'Prepare a useful crew handover and a focused petroleum inspection study session, with clear limits for each tool.',
    readTime: '3 min read',
    dateModified: '2026-09-12',
    sections: [
      {
        heading: 'For a crew handover, start with the confirmed facts.',
        paragraphs: [
          'Before opening a coordination tool, collect the vessel and port, travel date, arrival details, meeting point and responsible contact. State the time zone. Mark anything awaiting confirmation so an estimate is not mistaken for an agreed arrangement.',
          'If the flight or vessel schedule changes, identify who updates the instructions and who needs to receive the change. Keep the current instructions distinguishable from earlier copies.'
        ],
        list: [
          'Confirmed: what the responsible agent or coordinator has actually agreed.',
          'Pending: missing pickup details or other arrangements still needing a reply.',
          'Next action: who follows up, with whom and by when.'
        ]
      },
      {
        heading: 'Read the Crew Change overview before registering.',
        paragraphs: [
          'The Amicus Crew Change page explains the tool and the route into its application. Use it to assess whether it fits the task you need to coordinate. If you are introducing it to a team, discuss that workflow with Amicus.',
          'An application record does not itself establish that a driver, launch or other local service has accepted the job. Obtain confirmation through the responsible party\'s agreed process.'
        ]
      },
      {
        heading: 'For petroleum inspection study, keep an error log.',
        paragraphs: [
          'Choose a topic for the session and keep a short list of questions you could not explain, even when you selected the right answer. Record the subject, why the answer was uncertain and which current official reference you need to review.',
          'The Amicus inspection practice tool supports independent study. A practice result is not a professional certificate or evidence that someone is ready to perform an inspection.'
        ]
      },
      {
        heading: 'Check the official programme before planning an exam.',
        paragraphs: [
          'TIC Council publishes the Petroleum Inspector Certification Programme, including training requirements and examination information. Use its current materials and your employer\'s training arrangements to understand the formal route. Independent quiz practice does not replace those requirements.',
          'For work in the field, use the applicable procedures and responsible supervisor\'s instructions. A general resource article or study tool cannot settle a job-specific measurement, reporting or safety question.'
        ],
        sources: [sources.inspection]
      }
    ],
    callout: { heading: 'Bring the task to the conversation.', text: 'When contacting Amicus, describe the workflow, who uses it and where information gets missed. That is more useful than a general request for another application.' },
    primaryCta: { href: '/solutions/inspection', label: 'About inspection practice' },
    secondaryCta: { href: '/solutions/crew-change', label: 'About Crew Change' },
    nextStep: 'Read the relevant product overview before opening an application, or discuss your operational requirement with Amicus.',
    relatedSlugs: ['crew-change-connectivity']
  }
];
