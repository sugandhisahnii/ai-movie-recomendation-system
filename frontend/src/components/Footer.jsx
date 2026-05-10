import { BadgeHelp, Globe, Tv } from 'lucide-react';

const footerLinks = [
  'Audio Description',
  'Investor Relations',
  'Legal Notices',
  'Help Centre',
  'Jobs',
  'Cookie Preferences',
  'Gift Cards',
  'Terms of Use',
  'Corporate Information',
  'Media Centre',
  'Privacy',
  'Contact Us'
];

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0b0b0b] px-4 py-12 text-gray-400 sm:px-6 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-5 text-white">
          <a href="/" aria-label="Browse" className="transition hover:text-netflix-red">
            <Globe size={22} />
          </a>
          <a href="/" aria-label="Support" className="transition hover:text-netflix-red">
            <BadgeHelp size={22} />
          </a>
          <a href="/" aria-label="Media" className="transition hover:text-netflix-red">
            <Tv size={22} />
          </a>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {footerLinks.map((label) => (
            <a key={label} href="/" className="transition hover:text-white">
              {label}
            </a>
          ))}
        </div>

        <p className="mt-10 text-sm text-gray-500">© 2026 AIMOVIE, Inc.</p>
      </div>
    </footer>
  );
};

export default Footer;
