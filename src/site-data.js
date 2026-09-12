'use strict';
// Central reviewed destinations; prices and coverage stay in the dedicated store.
const site = {
  name: 'Amicus Shipping LLC', url: 'https://amicusshippingllc.com',
  legalName: 'Amicus Shipping LLC',
  founder: { name: 'Jivko Atanassov', id: 'https://amicusshippingllc.com/about#jivko-atanassov', image: '/assets/media/jivko-atanassov-680.jpg' },
  sameAs: ['https://sim.amicusshippingllc.com/about'],
  email: 'zhim57@yahoo.com',
  shopUrl: 'https://sim.amicusshippingllc.com/shop',
  helpUrl: 'https://sim.amicusshippingllc.com/help',
  installationUrl: 'https://sim.amicusshippingllc.com/help#installation',
  supportUrl: 'https://sim.amicusshippingllc.com/support',
  accountUrl: 'https://sim.amicusshippingllc.com/account',
  businessUrl: 'https://sim.amicusshippingllc.com/crew',
  socialImage: '/assets/media/amicus-social-card-1200x630.jpg',
  socialImageAlt: 'Amicus Shipping LLC — Maritime knowledge. Practical tools.',
  inquiryUrls: {
    connectivity: '/contact?visitorType=Ship%20Operator%20%2F%20Manager&interest=Crew%20Connectivity',
    operations: '/contact?interest=Crew%20Change',
    tools: '/contact?interest=Maritime%20Tools',
    seafarer: '/contact?visitorType=Seafarer&interest=eSIM%20%2F%20Travel%20Connectivity'
  },
  crewLandingUrl: '/solutions/crew-change',
  crewUrl: 'https://crew.ship-port.com/register',
  inspectionLandingUrl: '/solutions/inspection',
  inspectionUrl: 'https://calm-ridge-53583.herokuapp.com/',
  analyticsOrigin: 'https://analytics.amicusshippingllc.com',
  analyticsWebsiteId: '6340d256-68a3-48d9-b975-787cb32959b0',
  nav: [
    { href: '/solutions', label: 'Solutions' },
    { href: '/seafarers', label: 'Seafarers' },
    { href: '/operators', label: 'Operators' },
    { href: '/resources', label: 'Resources' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ]
};
const resources = require('./resources');
/** @type {Record<string, {view: string, title: string, description: string, [key: string]: unknown}>} */
const pages = {
  '/': { view: 'index', title: 'Amicus Shipping LLC | Maritime Connectivity & Digital Tools', description: 'Maritime experience behind crew connectivity, eSIM travel plans and crew-change tools. Meet Amicus Shipping LLC and find solutions for seafarers and shipping teams.' },
  '/solutions': { view: 'solutions', title: 'Maritime Solutions for Crews & Operators | Amicus Shipping', description: 'Explore crew connectivity, crew-change tools and professional maritime resources, with clear paths to the Amicus eSIM store and operational tools.' },
  '/seafarers': { view: 'seafarers', title: 'Solutions for Seafarers | Amicus Shipping LLC', description: 'Amicus support for the journey between vessel and home: connectivity, crew-change coordination and maritime guides, with direct access to the dedicated eSIM store.' },
  '/operators': { view: 'operators', title: 'Crew Connectivity for Ship Operators & Managers | Amicus Shipping LLC', description: 'Prepare joining crew for multi-country travel. Discuss crew eSIM discount-code batches, repeat rotations and coordination tools with Amicus Shipping LLC.' },
  '/solutions/crew-change': { view: 'crew-change', parent: 'solutions', heading: 'Amicus Crew Change', title: 'Crew Change Tool | Amicus Shipping LLC', description: 'Understand Amicus Crew Change before registering: connect crew and coordinators around vessel details, journey stages and updates in a shared workflow.' },
  '/solutions/inspection': { view: 'inspection', parent: 'solutions', heading: 'Petroleum Inspection Study', title: 'Petroleum Inspection Study Tool | Amicus Shipping LLC', description: 'Explore the Amicus petroleum inspection study tool for question practice. Independent preparation that does not replace official training or award certification.' },
  '/resources': { view: 'resources', title: 'Maritime Guides & Professional Resources | Amicus Shipping', description: 'Practical guides for eSIM preparation, crew-change connectivity and maritime tools, curated by Amicus Shipping LLC.' },
  '/about': { view: 'about', title: 'About Amicus Shipping LLC | Maritime Experience & Digital Solutions', description: 'Meet founder Jivko Atanassov. Experience in ship agency, marine superintendent work and petroleum inspection shapes Amicus connectivity and crew-change tools.' },
  '/contact': { view: 'contact', title: 'Contact Amicus Shipping | Crew & Business Inquiries', description: 'Contact Amicus Shipping about crew connectivity, crew-change tools, maritime resources or a business inquiry.' },
  '/privacy': { view: 'legal', kind: 'privacy', title: 'Privacy Notice | Amicus Shipping LLC', description: 'How this corporate website handles inquiry details, analytics and links to separate services.' },
  '/terms': { view: 'legal', kind: 'terms', title: 'Website Terms | Amicus Shipping LLC', description: 'Information about using the Amicus Shipping corporate website, its resources and links to separate services.' }
};
for (const resource of resources) {
  pages['/resources/' + resource.slug] = { view: 'article', ...resource, description: resource.summary, title: resource.title + ' | Amicus Shipping', heading: resource.title };
}
module.exports = { site, pages, resources };
