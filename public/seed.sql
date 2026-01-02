-- Database Seed for We Are Collaborative
-- Upload this file to phpMyAdmin

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- BrandConfig
INSERT INTO BrandConfig (id, name, tagline, logo, defaultEmail, domain, heroImage) VALUES
(1, 'We Are Collaborative', 'Empowering Brands Through Strategic Collaboration', '/logo.png', 'hello@wearecollaborative.net', 'wearecollaborative.net', '/hero-bg.jpg');

-- ThemeConfig
INSERT INTO ThemeConfig (id, primaryColor, secondaryColor, accentColor, backgroundColor, cardBackground, sectionPadding) VALUES
(1, '#6366f1', '#8b5cf6', '#ec4899', '#0a0a0a', '#1a1a1a', '2rem');

-- SectionContent (Hero)
INSERT INTO SectionContent (sectionId, headline, subheadline, badge) VALUES
('hero', 'Transform Your Brand with Strategic Collaboration', 'We partner with forward-thinking brands to create impactful marketing campaigns that drive real results.', 'Welcome');

-- Services
INSERT INTO Service (title, description, icon, `order`) VALUES
('Digital Strategy', 'Comprehensive digital marketing strategies tailored to your business goals.', 'strategy', 1),
('Creative Campaigns', 'Award-winning creative campaigns that capture attention and drive engagement.', 'creative', 2),
('Data Analytics', 'Data-driven insights to optimize your marketing performance and ROI.', 'analytics', 3);

-- Clients
INSERT INTO Client (name, logo, `order`) VALUES
('TechCorp', '/clients/techcorp.png', 1),
('InnovateCo', '/clients/innovateco.png', 2),
('GlobalBrand', '/clients/globalbrand.png', 3);

-- Case Studies
INSERT INTO CaseStudy (title, slug, description, image, client, category, results, isFeatured, `order`) VALUES
('Digital Transformation for TechCorp', 'techcorp-digital-transformation', 'How we helped TechCorp achieve 300% growth in digital engagement.', '/case-studies/techcorp.jpg', 'TechCorp', 'Technology', '{"engagement": "300% increase", "roi": "150%"}', 1, 1);

-- Blog Posts
INSERT INTO BlogPost (title, slug, excerpt, content, image, author, isPublished, date) VALUES
('The Future of Digital Marketing in 2024', 'future-digital-marketing-2024', 'Exploring the trends that will shape digital marketing in the coming year.', 'Full blog post content here...', '/blog/future-marketing.jpg', 'Marketing Team', 1, NOW());

-- Admin User
-- Password is 'admin123'
INSERT INTO User (email, password, name, role) VALUES
('admin@wearecollaborative.net', 'admin123', 'Admin User', 'admin');

COMMIT;
