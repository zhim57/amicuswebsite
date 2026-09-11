'use strict';
// Central reviewed destinations; prices and coverage stay in the dedicated store.
const site = {
  name: 'Amicus Shipping LLC', url: 'https://amicusshippingllc.com',
  email: 'zhim57@yahoo.com',
  shopUrl: 'https://sim.amicusshippingllc.com/shop',
  helpUrl: 'https://sim.amicusshippingllc.com/help',
  installationUrl: 'https://sim.amicusshippingllc.com/help#installation',
  crewUrl: 'https://crew.ship-port.com/register',
  inspectionUrl: 'https://calm-ridge-53583.herokuapp.com/',
  analyticsOrigin: 'https://analytics.amicusshippingllc.com',
  analyticsWebsiteId: '6340d256-68a3-48d9-b975-787cb32959b0',
  nav: [
    { href: '/solutions', label: 'Solutions' },
    { href: '/seafarers', label: 'Seafarers' },
    { href: '/operators', label: 'Operators & Agencies' },
    { href: '/resources', label: 'Resources' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ]
};
const resources = [
  { slug: 'esim-before-you-travel', category: 'Crew connectivity', title: 'Your eSIM checklist before you travel', summary: 'Device checks, plan coverage and installation: what to prepare before your next journey.', readTime: '3 min read' },
  { slug: 'crew-change-connectivity', category: 'Crew change', title: 'Stay connected through a crew change', summary: 'Plan for the airport, onward travel and arrival at the port.', readTime: '3 min read' },
  { slug: 'maritime-tools', category: 'Professional resources', title: 'Practical tools for maritime work', summary: 'Where to find crew coordination and petroleum inspection study tools.', readTime: '2 min read' }
];
/** @type {Record<string, {view: string, title: string, description: string, [key: string]: unknown}>} */
const pages = {
  '/': { view: 'index', title: 'Maritime Connectivity & Practical Digital Tools | Amicus Shipping LLC', description: 'Crew connectivity, crew-change tools and maritime resources. Practical solutions for seafarers, ship operators and agencies from Amicus Shipping LLC.' },
  '/solutions': { view: 'solutions', title: 'Maritime Solutions for Crews & Operators | Amicus Shipping', description: 'Explore crew connectivity, crew-change tools and professional maritime resources, with clear paths to the Amicus eSIM store and operational tools.' },
  '/seafarers': { view: 'seafarers', title: 'eSIM Connectivity for Seafarers | Amicus Shipping', description: 'Prepare mobile data for crew-change travel, port calls and shore leave. Find eSIM plans, check your phone and follow installation guidance.' },
  '/operators': { view: 'operators', title: 'Solutions for Operators & Maritime Agencies | Amicus Shipping', description: 'Discuss crew connectivity, repeat travel requirements and practical operational tools with Amicus Shipping LLC.' },
  '/resources': { view: 'resources', title: 'Maritime Guides & Professional Resources | Amicus Shipping', description: 'Practical guides for eSIM preparation, crew-change connectivity and maritime tools, curated by Amicus Shipping LLC.' },
  '/about': { view: 'about', title: 'About Amicus Shipping LLC | Maritime Knowledge, Practical Tools', description: 'Meet the thinking behind Amicus Shipping: maritime knowledge applied to connectivity, crew coordination and useful digital tools.' },
  '/contact': { view: 'contact', title: 'Contact Amicus Shipping | Crew & Business Inquiries', description: 'Contact Amicus Shipping about crew connectivity, crew-change tools, maritime resources or a business inquiry.' },
  '/privacy': { view: 'legal', kind: 'privacy', title: 'Privacy Notice | Amicus Shipping LLC', description: 'How this corporate website handles inquiry details, analytics and links to separate services.' },
  '/terms': { view: 'legal', kind: 'terms', title: 'Website Terms | Amicus Shipping LLC', description: 'Information about using the Amicus Shipping corporate website, its resources and links to separate services.' }
};
for (const resource of resources) {
  pages['/resources/' + resource.slug] = { view: 'article', ...resource, description: resource.summary, title: resource.title + ' | Amicus Shipping', heading: resource.title };
}
module.exports = { site, pages, resources };
