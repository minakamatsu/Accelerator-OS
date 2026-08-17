# Milestone 4 pilot content inventory

Pilot: `[DEMO] Atlas Auto Repair`

This is a clearly fictional development pilot. It demonstrates the delivery system and design quality without representing a real business, customer, rating, certification, guarantee, or offer.

## Approved source map

| Public module            | Approved input                                                                             | Source                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Business identity        | `[DEMO] Atlas Auto Repair`; general automotive repair                                      | `supabase/seed.sql` business fixture                     |
| Primary CTA              | `Request a demo quote`; phone-first contact                                                | `business_profiles.primary_cta` and `contact_preference` |
| Value proposition        | Clear, practical automotive care using fictional development content                       | `business_profiles.value_proposition`                    |
| Phone and email          | Fictional `555` phone and `example.com` email                                              | `business_profiles`                                      |
| Address and service area | Fictional Demo Lane address and fictional local service area                               | `business_profiles`                                      |
| Hours                    | Monday–Friday, 8:00 AM–5:00 PM; weekend closed                                             | `business_profiles.hours`                                |
| Services                 | Routine maintenance, brake/safety checks, check-engine diagnostics, steering/ride concerns | Active `services` fixtures                               |
| Brand palette            | Forest `#123B35` and acid lime `#D8F23F`                                                   | `brand_settings.color_direction`                         |
| Logo                     | Text wordmark; no real logo supplied                                                       | `brand_settings.logo_treatment`                          |
| Typography and shape     | Sturdy editorial sans; soft-industrial geometry                                            | `brand_settings`                                         |
| Motion                   | Restrained, with a reduced-motion fallback                                                 | `brand_settings.motion_preferences`                      |
| Signature feature        | Service-triage selector                                                                    | `brand_settings.signature_feature`                       |
| Image rights             | Generic automotive stock approved for the fictional preview; no client imagery supplied    | User approval and image-source register below            |
| Domain                   | `demo-atlas-auto.localhost` for verified local host routing                                | `business_domains` fixture                               |

## Image-source register

All three files are generic preview imagery and do not depict Atlas Auto Repair, its staff, property, customers, or completed work. Pexels permits free website use and modification; attribution is optional but recorded here for provenance. License checked August 15, 2026: <https://www.pexels.com/license/>.

| Local file                                   | Creator        | Original source                                                                   | Use                                  |
| -------------------------------------------- | -------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| `public/images/atlas-auto/service-bay.jpg`   | Enis Yavuz     | <https://www.pexels.com/photo/mechanic-repairing-a-vehicle-5276374/>              | Mobile-first hero service-bay scene  |
| `public/images/atlas-auto/engine-detail.jpg` | Sergey Meshkov | <https://www.pexels.com/photo/mechanic-fixing-a-car-8478233/>                     | Supporting engine-compartment detail |
| `public/images/atlas-auto/under-hood.jpg`    | Anna Shvets    | <https://www.pexels.com/photo/an-auto-mechanic-repairing-the-car-engine-4315572/> | Supporting hands-and-tools detail    |

## Required content coverage

- Branded sticky navigation and text wordmark
- Focused home gateway with hero and approved value proposition
- Phone-first primary CTA and persistent mobile call control
- Explicit fictional-development disclosure
- Verified-essentials strip without invented proof
- Service directory and one detail route per verified active service
- Honest unpublished-services state when no approved service inventory exists
- Dedicated, accessible “What are you noticing?” vehicle-concerns guide
- Plain-language three-step first-conversation guide
- Dedicated visit page with contact, address, directions, and hours
- Shared business navigation, footer, and demo disclosure
- Route-specific title, description, Open Graph, Twitter, theme color, and social image
- Production-only canonical URLs, verified-fact structured data, sitemap, and robots policy
- Nested custom-domain routes and platform preview routes
- Neutral unavailable state for unknown, draft, or suspended tenants

## Deliberate omissions

No rating, review count, testimonial, certification, warranty, guarantee, years-in-business claim, staff biography, real offer, review CTA, or client photograph is shown because none was approved. Generic licensed photos establish the automotive setting without representing the fictional shop as real.

## Original design decisions

“Service Bay Signal” now opens inside the service bay: a photo-led mobile hero, dark glass conversation card, repair-detail image pair, asymmetric soft-industrial layout, and interactive symptom-to-conversation guide. The home page acts as a gateway into a service directory, verified service details, a vehicle-concerns guide, and a visit page; each route has one clear visitor intent and a related next step. Its spacing and typography begin with a 390px mobile source layout; tablet and desktop columns are progressive enhancements rather than desktop compositions scaled down. Its structure, tokens, hero composition, service treatment, and interaction were created for this fictional pilot and were not copied from another business site.
