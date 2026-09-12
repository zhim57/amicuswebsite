const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const { site, pages, resources } = require('./src/site-data');
const { securityHeaders, parseTrustProxy } = require('./src/server/security');
const { createContact, contactOptions } = require('./src/server/contact');
const { createMailer } = require('./src/server/mail');
const { getMedia } = require('./src/media');

function createApp(environment = process.env, integrations = {}) {
  const app = express();
  const assetsDir = path.join(__dirname, 'public', 'assets');
  const quarantinedPhoto = path.join(assetsDir, 'images', 'ps4.jpg');
  const uploadDir = environment.UPLOAD_DIR
    ? path.resolve(environment.UPLOAD_DIR)
    : path.join(__dirname, 'uploads');

  app.disable('x-powered-by');
  app.set('trust proxy', parseTrustProxy(environment.TRUST_PROXY));
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.locals.analyticsEnabled = environment.NODE_ENV === 'production' && environment.ANALYTICS_ENABLED !== 'false';
  app.locals.media = { crewConnectivity: getMedia('crewConnectivity'), operations: getMedia('operations') };
  app.use(securityHeaders({ production: environment.NODE_ENV === 'production', analyticsOrigin: site.analyticsOrigin }));
  app.use((req, res, next) => {
    // Canonicalize only the known company alias; never construct a redirect from an arbitrary Host.
    if (['GET', 'HEAD'].includes(req.method) && req.hostname === 'www.amicusshippingllc.com') {
      return res.redirect(301, site.url + req.originalUrl);
    }
    return next();
  });

  // UPLOAD_DIR is read only as a deny boundary for old deployment configurations.
  // It is never storage used by this application.
  const mailer = createMailer({ environment, recipient: site.email, transport: integrations.mailTransport });
  const contact = createContact({ secret: environment.CONTACT_FORM_SECRET, sendMail: integrations.contactSendMail || mailer.sendMail });
  app.locals.contactAvailable = mailer.configured || typeof integrations.contactSendMail === 'function';
  const canonicalOrigin = new URL(site.url).origin;

  function renderPage(req, res, route = req.path, extra = {}) {
    const page = pages[route];
    return res.render(page.view, {
      site, page, resources,
      currentPath: route,
      canonicalUrl: canonicalOrigin + (route === '/' ? '/' : route),
      currentYear: new Date().getFullYear(),
      contactOptions,
      form: contact.emptyForm(route === '/contact' && req.method === 'GET' ? req.query : {}),
      ...extra,
    });
  }

  function gone(req, res) {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    res.set('Cache-Control', 'no-store');
    return res.status(410).type('text').send('This public resource is no longer available. Please visit /resources for curated maritime information.');
  }

  // All methods are blocked before parsing bodies or touching the filesystem.
  app.use(['/upload', '/uploads', '/files', '/api/upload', '/api/uploads', '/api/resources', '/resources/upload', '/rewards', '/rewards.html', '/rewards_program.html'], gone);

  const redirects = {
    '/index.html': '/',
    '/resources.html': '/resources',
    '/contact.html': '/contact',
    '/services.html': '/solutions',
    '/about.html': '/about',
    '/buy_sim.html': '/contact#existing-sim',
    '/buy_Dsim.html': '/contact#existing-sim',
    '/crew_change.html': '/solutions/crew-change',
    '/operators-agencies': '/operators',
    '/privacy_policy.html': '/privacy',
    '/Terms_and_conditions.html': '/terms',
    '/deleted_code/contact.html': '/contact',
    '/deleted_code/services.html': '/solutions',
    '/deleted_code/resources.html': '/resources',
    '/deleted_code/buy_sim.html': '/contact#existing-sim',
    '/deleted_code/buy_Dsim.html': '/contact#existing-sim',
    '/deleted_code/crew_change.html': '/solutions/crew-change',
    '/deleted_code/privacy_policy.html': '/privacy',
    '/deleted_code/Terms_and_conditions.html': '/terms',
  };
  for (const [from, to] of Object.entries(redirects)) {
    app.get(from, (req, res) => {
      if (from.startsWith('/deleted_code/')) res.set('X-Robots-Tag', 'noindex, nofollow');
      res.redirect(301, to);
    });
  }
  app.use('/deleted_code', gone);

  app.get('/favicon.ico', (req, res) => res.redirect(301, '/assets/images/favicon.svg'));

  // Only reviewed site assets are public. Never expose an UPLOAD_DIR nested here,
  // including an asset symlink that resolves into retained upload storage.
  app.use('/assets', (req, res, next) => {
    try {
      const candidate = path.resolve(assetsDir, '.' + decodeURIComponent(req.path));
      if (!isWithin(assetsDir, candidate) || isWithin(uploadDir, candidate) || isWithin(quarantinedPhoto, candidate)) return gone(req, res);
      if (fs.existsSync(candidate)) {
        const realAsset = fs.realpathSync(candidate);
        const realUploads = fs.existsSync(uploadDir) ? fs.realpathSync(uploadDir) : uploadDir;
        if (!isWithin(assetsDir, realAsset) || isWithin(realUploads, realAsset) || isWithin(quarantinedPhoto, realAsset)) return gone(req, res);
      }
      return next();
    } catch (error) {
      return res.status(400).type('text').send('Invalid asset path.');
    }
  }, express.static(assetsDir, {
    dotfiles: 'deny', index: false, redirect: false, maxAge: '1h',
    setHeaders(res, assetPath) {
      if (isWithin(path.join(assetsDir, 'docs'), assetPath)) {
        res.set('X-Robots-Tag', 'noindex, nofollow');
        res.attachment(path.basename(assetPath));
      }
    },
  }));

  app.get('/robots.txt', (req, res) => {
    // Allow crawlers to see the 410/noindex response for retired upload URLs.
    res.type('text').send(`User-agent: *\nAllow: /\n\nSitemap: ${canonicalOrigin}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req, res) => {
    const urls = Object.entries(pages)
      .filter(([, page]) => page.sitemap !== false && !page.noindex)
      .map(([route]) => `  <url><loc>${escapeXml(canonicalOrigin + route)}</loc></url>`);
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  });

  app.post('/contact',
    (req, res, next) => {
      res.set('Cache-Control', 'no-store');
      res.set('X-Robots-Tag', 'noindex, nofollow');
      next();
    },
    contact.rateLimit,
    express.urlencoded({ extended: false, limit: '16kb', parameterLimit: 20 }),
    async (req, res, next) => {
      try {
        const form = await contact.process(req, canonicalOrigin);
        res.status(form.status);
        return renderPage(req, res, '/contact', { form });
      } catch (error) {
        return next(error);
      }
    });

  for (const route of Object.keys(pages)) {
    app.get(route, (req, res) => {
      if (route === '/contact') res.set('Cache-Control', 'no-store');
      if (pages[route].noindex) res.set('X-Robots-Tag', 'noindex, follow');
      return renderPage(req, res, route);
    });
  }

  app.use((req, res) => {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    const page = { title: 'Page not found', description: 'Find your way back to Amicus Shipping.', status: 404, heading: 'Page not found', message: 'Find the maritime solutions, resources and contact information you need below.', noindex: true };
    res.status(404).render('error', {
      site, page, resources, currentPath: '', canonicalUrl: canonicalOrigin + '/', currentYear: new Date().getFullYear(),
    });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.set('Cache-Control', 'no-store');
    res.set('X-Robots-Tag', 'noindex, nofollow');
    const status = error.type === 'entity.too.large' || error.type === 'parameters.too.many' ? 413 : [400, 429].includes(error.status) ? error.status : 500;
    if (req.path === '/contact' && status < 500) {
      res.status(status);
      return renderPage(req, res, '/contact', {
        form: { ...contact.emptyForm(), errors: { form: status === 429 ? 'Too many inquiry attempts. Please try again in 15 minutes, or use the email address below.' : 'The inquiry could not be read. Please keep the message below 2,000 characters and try again.' } },
      });
    }
    // Do not log request bodies, form contents, credentials, or stack traces to clients.
    if (status === 500) console.error('Request failed', { method: req.method, status });
    return res.status(status).type('text').send(status === 500 ? 'Something went wrong. Please try again later.' : 'Invalid request.');
  });

  return app;
}

function isWithin(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}

function escapeXml(value) {
  return value.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[character]));
}

const app = createApp();
const PORT = process.env.PORT || 3016;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
