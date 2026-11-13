-- Sample content for Suvarna Karnataka Janashakti Vedike.
-- Run AFTER the migration (supabase/migrations/*_skjv_init.sql). Safe to run once on an empty database.
-- Everything here can be edited or deleted later from the admin panel.

begin;

-- settings
insert into public.settings (key, value) values
  ('membership_fee', '1500'),
  ('card_validity', 'Lifetime'),
  ('president_name', 'Nagenahalli Krishnamurthy'),
  ('president_name_kn', 'ನಾಗೇನಹಳ್ಳಿ ಕೃಷ್ಣಮೂರ್ತಿ'),
  ('phone', '+91 98450 00000'),
  ('email', 'info@skjv.org'),
  ('whatsapp', '919845000000'),
  ('address_en', 'Suvarna Karnataka Janashakti Vedike, Central Office, Bengaluru, Karnataka 560001'),
  ('address_kn', 'ಸುವರ್ಣ ಕರ್ನಾಟಕ ಜನಶಕ್ತಿ ವೇದಿಕೆ, ಕೇಂದ್ರ ಕಚೇರಿ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ 560001'),
  ('map_embed', ''),
  ('instagram_handle', 'skjv_karnataka'),
  ('instagram_url', 'https://instagram.com/'),
  ('facebook_url', 'https://facebook.com/'),
  ('youtube_url', 'https://youtube.com/'),
  ('x_url', 'https://x.com/'),
  ('stat_members', '25000'),
  ('stat_districts', '31'),
  ('stat_campaigns', '120'),
  ('stat_volunteers', '4800')
on conflict (key) do update set value = excluded.value;

-- slides
insert into public.slides (image, title, link, sort, active) values
  ('/images/hero-2.jpg', 'Suvarna Karnataka Janashakti Vedike', '/about', 0, true),
  ('/images/hero-3.jpg', 'Sanghatane, Horata, Nadaseve', '/join', 1, true),
  ('/images/hero-4.jpg', 'Kannadave namma usiru, Karnatakave namma hemme', '/gallery', 2, true),
  ('/images/hero-1.jpg', 'Kannada, Kannadiga, Karnataka', '/campaigns', 3, true),
  ('/images/hero-5.jpg', 'Founder State President', '/leaders', 4, true);

-- wards
insert into public.wards (name, sort) values
  ('Ward 01', 1),
  ('Ward 02', 2),
  ('Ward 03', 3),
  ('Ward 04', 4),
  ('Ward 05', 5),
  ('Ward 06', 6),
  ('Ward 07', 7),
  ('Ward 08', 8),
  ('Ward 09', 9),
  ('Ward 10', 10),
  ('Ward 11', 11),
  ('Ward 12', 12),
  ('Ward 13', 13),
  ('Ward 14', 14),
  ('Ward 15', 15),
  ('Ward 16', 16),
  ('Ward 17', 17),
  ('Ward 18', 18),
  ('Ward 19', 19),
  ('Ward 20', 20),
  ('Ward 21', 21),
  ('Ward 22', 22),
  ('Ward 23', 23),
  ('Ward 24', 24),
  ('Ward 25', 25),
  ('Ward 26', 26),
  ('Ward 27', 27),
  ('Ward 28', 28),
  ('Ward 29', 29),
  ('Ward 30', 30),
  ('Ward 31', 31),
  ('Ward 32', 32),
  ('Ward 33', 33),
  ('Ward 34', 34),
  ('Ward 35', 35),
  ('Ward 36', 36),
  ('Ward 37', 37),
  ('Ward 38', 38),
  ('Ward 39', 39),
  ('Ward 40', 40)
on conflict (name) do nothing;

-- news
insert into public.news (slug, title_en, title_kn, category, published_at, excerpt_en, excerpt_kn, body_en, body_kn, image, featured) values
  ('vedike-celebrates-71st-kannada-rajyotsava-across-31-districts', 'Vedike celebrates 71st Kannada Rajyotsava across 31 districts', '31 ಜಿಲ್ಲೆಗಳಲ್ಲಿ 71ನೇ ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ಆಚರಿಸಿದ ವೇದಿಕೆ', 'Culture', '2026-11-01', 'Flag hoisting, cultural programmes and felicitation of Kannada achievers marked the celebrations in every district unit.', 'ಪ್ರತಿ ಜಿಲ್ಲಾ ಘಟಕದಲ್ಲಿ ಧ್ವಜಾರೋಹಣ, ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮ ಮತ್ತು ಕನ್ನಡ ಸಾಧಕರಿಗೆ ಸನ್ಮಾನ ನಡೆಯಿತು.', 'Suvarna Karnataka Janashakti Vedike celebrated the 71st Kannada Rajyotsava with great enthusiasm across all 31 districts of the state.

The Kannada flag was hoisted at every district office, followed by cultural programmes featuring local artists, students and senior citizens. Achievers from the fields of literature, sports, farming and social service were felicitated.

Addressing members, the Founder State President said the Vedike will continue to stand for the dignity of Kannada and the welfare of every Kannadiga.', 'ಸುವರ್ಣ ಕರ್ನಾಟಕ ಜನಶಕ್ತಿ ವೇದಿಕೆಯು ರಾಜ್ಯದ ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳಲ್ಲಿ 71ನೇ ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವವನ್ನು ಅದ್ದೂರಿಯಾಗಿ ಆಚರಿಸಿತು.

ಪ್ರತಿ ಜಿಲ್ಲಾ ಕಚೇರಿಯಲ್ಲಿ ಕನ್ನಡ ಧ್ವಜಾರೋಹಣ ನಡೆಯಿತು. ನಂತರ ಸ್ಥಳೀಯ ಕಲಾವಿದರು, ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಹಿರಿಯ ನಾಗರಿಕರಿಂದ ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು ನಡೆದವು. ಸಾಹಿತ್ಯ, ಕ್ರೀಡೆ, ಕೃಷಿ ಮತ್ತು ಸಮಾಜಸೇವೆ ಕ್ಷೇತ್ರದ ಸಾಧಕರನ್ನು ಸನ್ಮಾನಿಸಲಾಯಿತು.

ಸದಸ್ಯರನ್ನು ಉದ್ದೇಶಿಸಿ ಮಾತನಾಡಿದ ಸಂಸ್ಥಾಪಕ ರಾಜ್ಯಾಧ್ಯಕ್ಷರು, ಕನ್ನಡದ ಘನತೆ ಮತ್ತು ಪ್ರತಿಯೊಬ್ಬ ಕನ್ನಡಿಗನ ಹಿತಕ್ಕಾಗಿ ವೇದಿಕೆ ಸದಾ ನಿಲ್ಲುತ್ತದೆ ಎಂದು ಹೇಳಿದರು.', '/images/hero-4.jpg', true),
  ('memorandum-submitted-demanding-kannada-nameboards-in-all-shops', 'Memorandum submitted demanding Kannada nameboards in all shops', 'ಎಲ್ಲಾ ಅಂಗಡಿಗಳಲ್ಲಿ ಕನ್ನಡ ನಾಮಫಲಕಕ್ಕಾಗಿ ಮನವಿ ಸಲ್ಲಿಕೆ', 'Protest', '2026-10-22', 'A delegation met civic officials asking for strict enforcement of the 60% Kannada signage rule.', 'ಶೇ.60 ಕನ್ನಡ ನಾಮಫಲಕ ನಿಯಮವನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಜಾರಿಗೊಳಿಸುವಂತೆ ನಿಯೋಗ ಅಧಿಕಾರಿಗಳನ್ನು ಭೇಟಿ ಮಾಡಿತು.', 'A delegation of the Vedike met civic officials and submitted a memorandum seeking strict enforcement of the rule that requires Kannada to occupy at least 60% of all commercial nameboards.

The Vedike also announced a peaceful awareness drive in markets, where volunteers will request shop owners to display Kannada prominently.', 'ವಾಣಿಜ್ಯ ನಾಮಫಲಕಗಳಲ್ಲಿ ಕನಿಷ್ಠ ಶೇ.60ರಷ್ಟು ಕನ್ನಡ ಇರಬೇಕೆಂಬ ನಿಯಮವನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಜಾರಿಗೊಳಿಸಬೇಕೆಂದು ವೇದಿಕೆಯ ನಿಯೋಗ ಅಧಿಕಾರಿಗಳಿಗೆ ಮನವಿ ಸಲ್ಲಿಸಿತು.

ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಶಾಂತಿಯುತ ಜಾಗೃತಿ ಅಭಿಯಾನ ನಡೆಸಿ, ಅಂಗಡಿ ಮಾಲೀಕರಿಗೆ ಕನ್ನಡವನ್ನು ಪ್ರಮುಖವಾಗಿ ಪ್ರದರ್ಶಿಸುವಂತೆ ಸ್ವಯಂಸೇವಕರು ವಿನಂತಿಸಲಿದ್ದಾರೆ.', '/images/gallery/rally-crowd.jpg', false),
  ('free-health-camp-serves-1200-families', 'Free health camp serves 1,200 families', 'ಉಚಿತ ಆರೋಗ್ಯ ಶಿಬಿರದಲ್ಲಿ 1,200 ಕುಟುಂಬಗಳಿಗೆ ಸೇವೆ', 'Service', '2026-10-05', 'Doctors and volunteers provided free check-ups, medicines and eye screening.', 'ವೈದ್ಯರು ಮತ್ತು ಸ್ವಯಂಸೇವಕರು ಉಚಿತ ತಪಾಸಣೆ, ಔಷಧಿ ಮತ್ತು ಕಣ್ಣಿನ ಪರೀಕ್ಷೆ ಒದಗಿಸಿದರು.', 'More than 1,200 families benefited from the free health camp organised by the Vedike in partnership with local hospitals.

General check-ups, blood sugar and BP tests, eye screening and free medicines were provided. Patients needing further care were referred to partner hospitals.', 'ಸ್ಥಳೀಯ ಆಸ್ಪತ್ರೆಗಳ ಸಹಯೋಗದಲ್ಲಿ ವೇದಿಕೆ ಆಯೋಜಿಸಿದ್ದ ಉಚಿತ ಆರೋಗ್ಯ ಶಿಬಿರದಲ್ಲಿ 1,200ಕ್ಕೂ ಹೆಚ್ಚು ಕುಟುಂಬಗಳು ಪ್ರಯೋಜನ ಪಡೆದವು.

ಸಾಮಾನ್ಯ ತಪಾಸಣೆ, ರಕ್ತದ ಸಕ್ಕರೆ ಮತ್ತು ರಕ್ತದೊತ್ತಡ ಪರೀಕ್ಷೆ, ಕಣ್ಣಿನ ತಪಾಸಣೆ ಹಾಗೂ ಉಚಿತ ಔಷಧಿ ನೀಡಲಾಯಿತು.', '/images/gallery/soudha-sunset.jpg', false),
  ('scholarships-for-300-kannada-medium-students', 'Scholarships for 300 Kannada-medium students', '300 ಕನ್ನಡ ಮಾಧ್ಯಮ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನ', 'Announcement', '2026-09-18', 'Meritorious students from government Kannada schools will receive education support this year.', 'ಸರ್ಕಾರಿ ಕನ್ನಡ ಶಾಲೆಗಳ ಪ್ರತಿಭಾವಂತ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಈ ವರ್ಷ ಶೈಕ್ಷಣಿಕ ನೆರವು ದೊರೆಯಲಿದೆ.', 'The Vedike announced scholarships for 300 meritorious students studying in government Kannada-medium schools.

Applications can be submitted through district units. Selection will be based on marks and family income.', 'ಸರ್ಕಾರಿ ಕನ್ನಡ ಮಾಧ್ಯಮ ಶಾಲೆಗಳಲ್ಲಿ ಓದುತ್ತಿರುವ 300 ಪ್ರತಿಭಾವಂತ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನವನ್ನು ವೇದಿಕೆ ಘೋಷಿಸಿತು.

ಜಿಲ್ಲಾ ಘಟಕಗಳ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು. ಅಂಕಗಳು ಮತ್ತು ಕುಟುಂಬದ ಆದಾಯದ ಆಧಾರದ ಮೇಲೆ ಆಯ್ಕೆ ನಡೆಯಲಿದೆ.', '/images/our-works.jpg', false),
  ('lake-clean-up-drive-revives-hebbal-shoreline', 'Lake clean-up drive revives Hebbal shoreline', 'ಕೆರೆ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನದಿಂದ ಹೆಬ್ಬಾಳ ತೀರಕ್ಕೆ ಹೊಸ ಜೀವ', 'Service', '2026-08-30', 'Over 500 volunteers removed plastic waste and planted native trees along the lake.', '500ಕ್ಕೂ ಹೆಚ್ಚು ಸ್ವಯಂಸೇವಕರು ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ ತೆರವುಗೊಳಿಸಿ ಕೆರೆಯ ದಡದಲ್ಲಿ ಸಸಿ ನೆಟ್ಟರು.', 'Over 500 volunteers took part in a lake clean-up drive, removing nearly four tonnes of plastic waste and planting native trees along the shoreline.', '500ಕ್ಕೂ ಹೆಚ್ಚು ಸ್ವಯಂಸೇವಕರು ಕೆರೆ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನದಲ್ಲಿ ಪಾಲ್ಗೊಂಡು ಸುಮಾರು ನಾಲ್ಕು ಟನ್ ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ ತೆರವುಗೊಳಿಸಿ, ದಡದಲ್ಲಿ ದೇಶೀಯ ಸಸಿಗಳನ್ನು ನೆಟ್ಟರು.', '/images/gallery/waterfall.jpg', false),
  ('founder-addresses-youth-convention-in-mysuru', 'Founder addresses youth convention in Mysuru', 'ಮೈಸೂರಿನಲ್ಲಿ ಯುವ ಸಮಾವೇಶ ಉದ್ದೇಶಿಸಿ ಸಂಸ್ಥಾಪಕರ ಭಾಷಣ', 'Press', '2026-08-12', 'Thousands of young Kannadigas gathered to discuss jobs, language and leadership.', 'ಉದ್ಯೋಗ, ಭಾಷೆ ಮತ್ತು ನಾಯಕತ್ವದ ಕುರಿತು ಚರ್ಚಿಸಲು ಸಾವಿರಾರು ಯುವ ಕನ್ನಡಿಗರು ಸೇರಿದ್ದರು.', 'Thousands of young Kannadigas attended the Vedike youth convention in Mysuru. Sessions covered local employment, Kannada in technology and grassroots leadership.', 'ಮೈಸೂರಿನಲ್ಲಿ ನಡೆದ ವೇದಿಕೆಯ ಯುವ ಸಮಾವೇಶದಲ್ಲಿ ಸಾವಿರಾರು ಯುವ ಕನ್ನಡಿಗರು ಭಾಗವಹಿಸಿದ್ದರು. ಸ್ಥಳೀಯ ಉದ್ಯೋಗ, ತಂತ್ರಜ್ಞಾನದಲ್ಲಿ ಕನ್ನಡ ಮತ್ತು ತಳಮಟ್ಟದ ನಾಯಕತ್ವದ ಕುರಿತು ಗೋಷ್ಠಿಗಳು ನಡೆದವು.', '/images/gallery/mysore-palace.jpg', false)
on conflict (slug) do nothing;

-- gallery
insert into public.gallery (image, title_en, title_kn, album, sort) values
  ('/images/gallery/veerangane.jpg', 'Statue of a Kannada warrior queen', 'ಕನ್ನಡದ ವೀರವನಿತೆಯ ಪ್ರತಿಮೆ', 'Heritage', 0),
  ('/images/gallery/mysore-palace.jpg', 'Mysuru Palace', 'ಮೈಸೂರು ಅರಮನೆ', 'Heritage', 1),
  ('/images/gallery/rally-crowd.jpg', 'Kannada pride rally', 'ಕನ್ನಡ ಅಭಿಮಾನ ಜಾಥಾ', 'Protests', 2),
  ('/images/gallery/heritage-chariot.jpg', 'Stone chariot, Hampi', 'ಹಂಪಿಯ ಕಲ್ಲಿನ ರಥ', 'Heritage', 3),
  ('/images/gallery/vidhana-soudha.jpg', 'Vidhana Soudha', 'ವಿಧಾನಸೌಧ', 'Events', 4),
  ('/images/gallery/flag-map.jpg', 'Our flag, our land', 'ನಮ್ಮ ಧ್ವಜ, ನಮ್ಮ ನಾಡು', 'Culture', 5),
  ('/images/gallery/rally-flags.jpg', 'Rajyotsava celebrations', 'ರಾಜ್ಯೋತ್ಸವ ಸಂಭ್ರಮ', 'Events', 6),
  ('/images/gallery/hill-fort.jpg', 'Hill fort with the Kannada flag', 'ಕನ್ನಡ ಧ್ವಜ ಹಾರುವ ಗಿರಿದುರ್ಗ', 'Heritage', 7),
  ('/images/gallery/soudha-sunset.jpg', 'Sunset at Vidhana Soudha', 'ಸಂಜೆಯ ವಿಧಾನಸೌಧ', 'Culture', 8),
  ('/images/gallery/waterfall.jpg', 'Nature of Karnataka', 'ಕರ್ನಾಟಕದ ಪ್ರಕೃತಿ', 'Service', 9),
  ('/images/our-works.jpg', 'Our work and achievements', 'ನಮ್ಮ ಕಾರ್ಯಗಳು ಮತ್ತು ಸಾಧನೆಗಳು', 'Service', 20),
  ('/images/poster.jpg', 'Sanghatane, Horata, Nadaseve', 'ಸಂಘಟನೆ, ಹೋರಾಟ, ನಾಡಸೇವೆ', 'Events', 21);

-- leaders
insert into public.leaders (name_en, name_kn, role_en, role_kn, tier, district, photo, bio_en, bio_kn, quote_en, quote_kn, sort) values
  ('Nagenahalli Krishnamurthy', 'ನಾಗೇನಹಳ್ಳಿ ಕೃಷ್ಣಮೂರ್ತಿ', 'Founder State President', 'ಸಂಸ್ಥಾಪಕ ರಾಜ್ಯಾಧ್ಯಕ್ಷರು', 'founder', 'Karnataka', '/images/gallery/founder.jpg', 'Founder of Suvarna Karnataka Janashakti Vedike, he has dedicated his life to organising Kannadigas, fighting for their rights and serving the land through education, health and social service initiatives.', 'ಸುವರ್ಣ ಕರ್ನಾಟಕ ಜನಶಕ್ತಿ ವೇದಿಕೆಯ ಸಂಸ್ಥಾಪಕರು. ಕನ್ನಡಿಗರನ್ನು ಸಂಘಟಿಸಿ, ಅವರ ಹಕ್ಕುಗಳಿಗಾಗಿ ಹೋರಾಡಿ, ಶಿಕ್ಷಣ, ಆರೋಗ್ಯ ಮತ್ತು ಸಮಾಜಸೇವೆಯ ಮೂಲಕ ನಾಡಸೇವೆಗೆ ತಮ್ಮ ಜೀವನವನ್ನು ಮುಡಿಪಾಗಿಟ್ಟಿದ್ದಾರೆ.', 'Kannada is our breath, Karnataka is our pride. Together, by the people and for the people, we will build a golden Karnataka.', 'ಕನ್ನಡವೇ ನಮ್ಮ ಉಸಿರು, ಕರ್ನಾಟಕವೇ ನಮ್ಮ ಹೆಮ್ಮೆ. ಜನರಿಂದ, ಜನರಿಗೋಸ್ಕರ – ಒಟ್ಟಾಗಿ ಸುವರ್ಣ ಕರ್ನಾಟಕವನ್ನು ಕಟ್ಟೋಣ.', 0),
  ('Ramesh Gowda', 'ರಮೇಶ್ ಗೌಡ', 'State Working President', 'ರಾಜ್ಯ ಕಾರ್ಯಾಧ್ಯಕ್ಷರು', 'state', 'Bengaluru', null, null, null, null, null, 1),
  ('Savitha Kulkarni', 'ಸವಿತಾ ಕುಲಕರ್ಣಿ', 'State Women Wing President', 'ರಾಜ್ಯ ಮಹಿಳಾ ಘಟಕ ಅಧ್ಯಕ್ಷರು', 'state', 'Dharwad', null, null, null, null, null, 2),
  ('Manjunath Shetty', 'ಮಂಜುನಾಥ್ ಶೆಟ್ಟಿ', 'State General Secretary', 'ರಾಜ್ಯ ಪ್ರಧಾನ ಕಾರ್ಯದರ್ಶಿ', 'state', 'Udupi', null, null, null, null, null, 3),
  ('Prakash Hiremath', 'ಪ್ರಕಾಶ್ ಹಿರೇಮಠ', 'State Youth Wing President', 'ರಾಜ್ಯ ಯುವ ಘಟಕ ಅಧ್ಯಕ್ಷರು', 'state', 'Belagavi', null, null, null, null, null, 4),
  ('Lakshmi Narayan', 'ಲಕ್ಷ್ಮಿ ನಾರಾಯಣ್', 'State Treasurer', 'ರಾಜ್ಯ ಖಜಾಂಚಿ', 'state', 'Mysuru', null, null, null, null, null, 5),
  ('Shivakumar B. R.', 'ಶಿವಕುಮಾರ್ ಬಿ. ಆರ್.', 'District President', 'ಜಿಲ್ಲಾಧ್ಯಕ್ಷರು', 'district', 'Mandya', null, null, null, null, null, 6),
  ('Anitha Reddy', 'ಅನಿತಾ ರೆಡ್ಡಿ', 'District President', 'ಜಿಲ್ಲಾಧ್ಯಕ್ಷರು', 'district', 'Kolar', null, null, null, null, null, 7),
  ('Basavaraj Patil', 'ಬಸವರಾಜ್ ಪಾಟೀಲ್', 'District President', 'ಜಿಲ್ಲಾಧ್ಯಕ್ಷರು', 'district', 'Kalaburagi', null, null, null, null, null, 8),
  ('Girish Naik', 'ಗಿರೀಶ್ ನಾಯ್ಕ್', 'District President', 'ಜಿಲ್ಲಾಧ್ಯಕ್ಷರು', 'district', 'Uttara Kannada', null, null, null, null, null, 9),
  ('Mahesh Kumar', 'ಮಹೇಶ್ ಕುಮಾರ್', 'Taluk President', 'ತಾಲ್ಲೂಕು ಅಧ್ಯಕ್ಷರು', 'taluk', 'Channapatna', null, null, null, null, null, 10),
  ('Roopa Devi', 'ರೂಪಾ ದೇವಿ', 'Taluk President', 'ತಾಲ್ಲೂಕು ಅಧ್ಯಕ್ಷರು', 'taluk', 'Hosakote', null, null, null, null, null, 11);

-- partners
insert into public.partners (name, logo, url, sort) values
  ('Kaveri Seva Foundation', null, '', 0),
  ('Hasiru Karnataka Initiative', null, '', 1),
  ('Vidya Jyothi Education Trust', null, '', 2),
  ('Janapada Kala Mandali', null, '', 3),
  ('Arogya Mitra Hospitals', null, '', 4),
  ('Namma Ooru Youth Forum', null, '', 5),
  ('Kannada Tech Collective', null, '', 6),
  ('Sahyadri Green Trust', null, '', 7);

-- instagram
insert into public.instagram (image, caption, url, likes, sort) values
  ('/images/poster.jpg', 'ಸಂಘಟನೆ | ಹೋರಾಟ | ನಾಡಸೇವೆ 💛❤️ #SKJV', 'https://instagram.com/', 1840, 0),
  ('/images/gallery/veerangane.jpg', 'ವೀರ ಪರಂಪರೆಯ ನಾಡು ನಮ್ಮದು 🚩', 'https://instagram.com/', 1320, 1),
  ('/images/gallery/rally-crowd.jpg', 'Kannada pride march – thank you Bengaluru!', 'https://instagram.com/', 2210, 2),
  ('/images/gallery/mysore-palace.jpg', 'ನಮ್ಮ ಮೈಸೂರು, ನಮ್ಮ ಹೆಮ್ಮೆ ✨', 'https://instagram.com/', 980, 3),
  ('/images/gallery/flag-map.jpg', 'Happy Kannada Rajyotsava! ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವದ ಶುಭಾಶಯಗಳು', 'https://instagram.com/', 3105, 4),
  ('/images/gallery/heritage-chariot.jpg', 'Hampi – where stone tells our story', 'https://instagram.com/', 1145, 5);

-- campaigns
insert into public.campaigns (slug, title_en, title_kn, start_date, end_date, time, venue_en, venue_kn, summary_en, summary_kn, body_en, body_kn, image) values
  ('kannada-habba-cultural-night', 'Kannada Habba – Cultural Night', 'ಕನ್ನಡ ಹಬ್ಬ – ಸಾಂಸ್ಕೃತಿಕ ಸಂಜೆ', '2026-11-29', null, '5:30 PM', 'Town Hall, Bengaluru', 'ಪುರಭವನ, ಬೆಂಗಳೂರು', 'An evening of Janapada songs, Yakshagana and poetry celebrating Rajyotsava month.', 'ರಾಜ್ಯೋತ್ಸವ ಮಾಸದ ಸಂಭ್ರಮಕ್ಕೆ ಜಾನಪದ ಗೀತೆ, ಯಕ್ಷಗಾನ ಮತ್ತು ಕಾವ್ಯ ವಾಚನದ ಸುಂದರ ಸಂಜೆ.', 'Join us for an evening dedicated to the arts of Karnataka. Folk singers, Yakshagana troupes and young poets will perform, and Kannada achievers from the city will be felicitated.

Entry is free for everyone. Members can collect their ID cards at the help desk.', 'ಕರ್ನಾಟಕದ ಕಲೆಗಳಿಗೆ ಮೀಸಲಾದ ಸಂಜೆಗೆ ನಮ್ಮೊಂದಿಗೆ ಸೇರಿ. ಜಾನಪದ ಗಾಯಕರು, ಯಕ್ಷಗಾನ ತಂಡಗಳು ಮತ್ತು ಯುವ ಕವಿಗಳು ಪ್ರದರ್ಶನ ನೀಡಲಿದ್ದು, ನಗರದ ಕನ್ನಡ ಸಾಧಕರನ್ನು ಸನ್ಮಾನಿಸಲಾಗುವುದು.

ಎಲ್ಲರಿಗೂ ಉಚಿತ ಪ್ರವೇಶ. ಸದಸ್ಯರು ಸಹಾಯ ಕೇಂದ್ರದಲ್ಲಿ ಗುರುತಿನ ಚೀಟಿ ಪಡೆಯಬಹುದು.', '/images/gallery/mysore-palace.jpg'),
  ('mega-blood-donation-camp', 'Mega Blood Donation Camp', 'ಬೃಹತ್ ರಕ್ತದಾನ ಶಿಬಿರ', '2026-12-13', null, '9:00 AM', 'Freedom Park, Bengaluru', 'ಫ್ರೀಡಂ ಪಾರ್ಕ್, ಬೆಂಗಳೂರು', 'Donate blood, save lives. Free health check-up for every donor.', 'ರಕ್ತದಾನ ಮಾಡಿ, ಜೀವ ಉಳಿಸಿ. ಪ್ರತಿ ದಾನಿಗೂ ಉಚಿತ ಆರೋಗ್ಯ ತಪಾಸಣೆ.', 'In partnership with local blood banks, we aim to collect 1,000 units in a single day. Every donor receives a free health check-up, refreshments and a certificate.

Please eat a good breakfast and carry a photo ID.', 'ಸ್ಥಳೀಯ ರಕ್ತನಿಧಿಗಳ ಸಹಯೋಗದಲ್ಲಿ ಒಂದೇ ದಿನದಲ್ಲಿ 1,000 ಯುನಿಟ್ ರಕ್ತ ಸಂಗ್ರಹಿಸುವ ಗುರಿ ಹೊಂದಿದ್ದೇವೆ. ಪ್ರತಿ ದಾನಿಗೂ ಉಚಿತ ಆರೋಗ್ಯ ತಪಾಸಣೆ, ಉಪಾಹಾರ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರ ನೀಡಲಾಗುವುದು.

ದಯವಿಟ್ಟು ಉಪಾಹಾರ ಸೇವಿಸಿ ಬನ್ನಿ ಮತ್ತು ಭಾವಚಿತ್ರವಿರುವ ಗುರುತಿನ ಚೀಟಿ ತನ್ನಿ.', '/images/gallery/rally-flags.jpg'),
  ('ward-level-membership-drive', 'Ward-level Membership Drive', 'ವಾರ್ಡ್ ಮಟ್ಟದ ಸದಸ್ಯತ್ವ ಅಭಿಯಾನ', '2026-12-20', '2027-01-10', '10:00 AM – 6:00 PM', 'All ward offices', 'ಎಲ್ಲಾ ವಾರ್ಡ್ ಕಚೇರಿಗಳು', 'Volunteers in every ward help Kannadigas join the Vedike and get their ID card on the spot.', 'ಪ್ರತಿ ವಾರ್ಡ್‌ನಲ್ಲಿ ಸ್ವಯಂಸೇವಕರು ಸದಸ್ಯತ್ವ ನೋಂದಣಿಗೆ ಸಹಾಯ ಮಾಡಿ ಸ್ಥಳದಲ್ಲೇ ಗುರುತಿನ ಚೀಟಿ ನೀಡುತ್ತಾರೆ.', 'For three weeks our volunteers will be at every ward office to help people register, pay the membership fee and download their member ID card instantly.', 'ಮೂರು ವಾರಗಳ ಕಾಲ ನಮ್ಮ ಸ್ವಯಂಸೇವಕರು ಪ್ರತಿ ವಾರ್ಡ್ ಕಚೇರಿಯಲ್ಲಿದ್ದು, ನೋಂದಣಿ, ಸದಸ್ಯತ್ವ ಶುಲ್ಕ ಪಾವತಿ ಮತ್ತು ಗುರುತಿನ ಚೀಟಿ ಪಡೆಯಲು ಸಹಾಯ ಮಾಡುತ್ತಾರೆ.', '/images/gallery/rally-crowd.jpg'),
  ('sankranti-janapada-utsava', 'Sankranti Janapada Utsava', 'ಸಂಕ್ರಾಂತಿ ಜಾನಪದ ಉತ್ಸವ', '2027-01-14', null, '4:00 PM', 'Basavanagudi Grounds, Bengaluru', 'ಬಸವನಗುಡಿ ಮೈದಾನ, ಬೆಂಗಳೂರು', 'Folk arts, ellu-bella, rangoli competition and traditional games for children.', 'ಜಾನಪದ ಕಲೆಗಳು, ಎಳ್ಳು-ಬೆಲ್ಲ, ರಂಗೋಲಿ ಸ್ಪರ್ಧೆ ಮತ್ತು ಮಕ್ಕಳಿಗೆ ಸಾಂಪ್ರದಾಯಿಕ ಆಟಗಳು.', 'Celebrate Sankranti the Karnataka way — Dollu Kunitha, Kamsale, a rangoli competition for women and traditional games for children. Ellu-bella will be distributed to all.', 'ಸಂಕ್ರಾಂತಿಯನ್ನು ಕರ್ನಾಟಕದ ರೀತಿಯಲ್ಲಿ ಆಚರಿಸೋಣ — ಡೊಳ್ಳು ಕುಣಿತ, ಕಂಸಾಳೆ, ಮಹಿಳೆಯರಿಗೆ ರಂಗೋಲಿ ಸ್ಪರ್ಧೆ ಮತ್ತು ಮಕ್ಕಳಿಗೆ ಸಾಂಪ್ರದಾಯಿಕ ಆಟಗಳು. ಎಲ್ಲರಿಗೂ ಎಳ್ಳು-ಬೆಲ್ಲ ವಿತರಣೆ.', '/images/gallery/heritage-chariot.jpg'),
  ('republic-day-kannada-pride-march', 'Republic Day Kannada Pride March', 'ಗಣರಾಜ್ಯೋತ್ಸವ ಕನ್ನಡ ಅಭಿಮಾನ ಜಾಥಾ', '2027-01-26', null, '8:00 AM', 'Mysore Bank Circle to Freedom Park', 'ಮೈಸೂರು ಬ್ಯಾಂಕ್ ವೃತ್ತದಿಂದ ಫ್ರೀಡಂ ಪಾರ್ಕ್‌ವರೆಗೆ', 'A peaceful march with the Kannada flag celebrating the Constitution and our language.', 'ಸಂವಿಧಾನ ಮತ್ತು ನಮ್ಮ ಭಾಷೆಯನ್ನು ಸಂಭ್ರಮಿಸುವ ಕನ್ನಡ ಧ್ವಜದೊಂದಿಗೆ ಶಾಂತಿಯುತ ಜಾಥಾ.', 'Members from all wards will walk together carrying the national flag and the Kannada flag. The march ends with a public meeting at Freedom Park.', 'ಎಲ್ಲಾ ವಾರ್ಡ್‌ಗಳ ಸದಸ್ಯರು ರಾಷ್ಟ್ರಧ್ವಜ ಮತ್ತು ಕನ್ನಡ ಧ್ವಜದೊಂದಿಗೆ ಒಟ್ಟಾಗಿ ನಡೆಯಲಿದ್ದಾರೆ. ಜಾಥಾ ಫ್ರೀಡಂ ಪಾರ್ಕ್‌ನಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಸಭೆಯೊಂದಿಗೆ ಮುಕ್ತಾಯವಾಗಲಿದೆ.', '/images/gallery/flag-map.jpg'),
  ('hasiru-karnataka-tree-plantation', 'Hasiru Karnataka Tree Plantation', 'ಹಸಿರು ಕರ್ನಾಟಕ ವೃಕ್ಷಾರೋಪಣ', '2027-02-08', null, '7:30 AM', 'Hesaraghatta Lake Bund', 'ಹೆಸರಘಟ್ಟ ಕೆರೆ ಏರಿ', 'Plant 5,000 native saplings with us and adopt a tree in your ward.', 'ನಮ್ಮೊಂದಿಗೆ 5,000 ದೇಶೀಯ ಸಸಿಗಳನ್ನು ನೆಡಿ ಮತ್ತು ನಿಮ್ಮ ವಾರ್ಡ್‌ನಲ್ಲಿ ಒಂದು ಮರವನ್ನು ದತ್ತು ಪಡೆಯಿರಿ.', 'Every sapling is adopted by a local family or school so it grows into a tree. Come with your family, bring a water bottle and plant a tree for Karnataka.', 'ಪ್ರತಿ ಸಸಿಯನ್ನು ಸ್ಥಳೀಯ ಕುಟುಂಬ ಅಥವಾ ಶಾಲೆ ದತ್ತು ಪಡೆದು ಮರವಾಗುವವರೆಗೆ ಪೋಷಿಸುತ್ತದೆ. ಕುಟುಂಬದೊಂದಿಗೆ ಬನ್ನಿ, ನೀರಿನ ಬಾಟಲಿ ತನ್ನಿ ಮತ್ತು ಕರ್ನಾಟಕಕ್ಕಾಗಿ ಒಂದು ಮರ ನೆಡಿ.', '/images/gallery/waterfall.jpg'),
  ('71st-kannada-rajyotsava-celebrations', '71st Kannada Rajyotsava Celebrations', '71ನೇ ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ಆಚರಣೆ', '2026-11-01', null, '9:00 AM', 'All 31 district units', 'ಎಲ್ಲಾ 31 ಜಿಲ್ಲಾ ಘಟಕಗಳು', 'Flag hoisting, cultural programmes and felicitation of achievers in every district.', 'ಪ್ರತಿ ಜಿಲ್ಲೆಯಲ್ಲಿ ಧ್ವಜಾರೋಹಣ, ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮ ಮತ್ತು ಸಾಧಕರಿಗೆ ಸನ್ಮಾನ.', 'The Kannada flag was hoisted at every district office, followed by cultural programmes and the felicitation of achievers in literature, sports, farming and social service.', 'ಪ್ರತಿ ಜಿಲ್ಲಾ ಕಚೇರಿಯಲ್ಲಿ ಕನ್ನಡ ಧ್ವಜಾರೋಹಣ, ನಂತರ ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮ ಹಾಗೂ ಸಾಹಿತ್ಯ, ಕ್ರೀಡೆ, ಕೃಷಿ ಮತ್ತು ಸಮಾಜಸೇವೆಯ ಸಾಧಕರಿಗೆ ಸನ್ಮಾನ ನಡೆಯಿತು.', '/images/hero-4.jpg'),
  ('free-health-camp', 'Free Health Camp', 'ಉಚಿತ ಆರೋಗ್ಯ ಶಿಬಿರ', '2026-10-05', null, '9:00 AM', 'Govt. School Grounds, Mandya', 'ಸರ್ಕಾರಿ ಶಾಲಾ ಮೈದಾನ, ಮಂಡ್ಯ', 'Free check-ups, medicines and eye screening for 1,200 families.', '1,200 ಕುಟುಂಬಗಳಿಗೆ ಉಚಿತ ತಪಾಸಣೆ, ಔಷಧಿ ಮತ್ತು ಕಣ್ಣಿನ ಪರೀಕ್ಷೆ.', 'Doctors from partner hospitals provided general check-ups, BP and sugar tests, eye screening and free medicines. Patients needing further care were referred to hospitals.', 'ಸಹಭಾಗಿ ಆಸ್ಪತ್ರೆಗಳ ವೈದ್ಯರು ಸಾಮಾನ್ಯ ತಪಾಸಣೆ, ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಸಕ್ಕರೆ ಪರೀಕ್ಷೆ, ಕಣ್ಣಿನ ತಪಾಸಣೆ ಹಾಗೂ ಉಚಿತ ಔಷಧಿ ನೀಡಿದರು.', '/images/gallery/soudha-sunset.jpg'),
  ('hebbal-lake-clean-up-drive', 'Hebbal Lake Clean-up Drive', 'ಹೆಬ್ಬಾಳ ಕೆರೆ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ', '2026-08-30', null, '7:00 AM', 'Hebbal Lake, Bengaluru', 'ಹೆಬ್ಬಾಳ ಕೆರೆ, ಬೆಂಗಳೂರು', '500 volunteers removed four tonnes of plastic and planted native trees.', '500 ಸ್ವಯಂಸೇವಕರು ನಾಲ್ಕು ಟನ್ ಪ್ಲಾಸ್ಟಿಕ್ ತೆರವುಗೊಳಿಸಿ ದೇಶೀಯ ಸಸಿಗಳನ್ನು ನೆಟ್ಟರು.', 'Over 500 volunteers removed nearly four tonnes of plastic waste and planted native trees along the shoreline.', '500ಕ್ಕೂ ಹೆಚ್ಚು ಸ್ವಯಂಸೇವಕರು ಸುಮಾರು ನಾಲ್ಕು ಟನ್ ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ ತೆರವುಗೊಳಿಸಿ ದಡದಲ್ಲಿ ದೇಶೀಯ ಸಸಿಗಳನ್ನು ನೆಟ್ಟರು.', '/images/gallery/hill-fort.jpg')
on conflict (slug) do nothing;

commit;
