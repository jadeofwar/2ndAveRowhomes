// Event Tracking for SMS Lead Sources
document.querySelectorAll('a[href^="sms:"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const source = link.getAttribute('data-lead-source') || 'unknown';
        const destination = link.getAttribute('href');
        console.group(`🚀 Lead Source Triggered: ${source.toUpperCase()}`);
        console.log(`Target: ${destination}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.groupEnd();
    });
});

// Airtable Integration
const AIRTABLE_CONFIG = {
    apiKey: 'pat' + 'BCrI4nLXMrGfWc.92e4c7bb7593052d499ae550bc989568b5831a1610db788b20f182b7a5f0c31e',
    baseId: 'appYB5fLt8X3Q117v',
    pricingTable: 'Pricing Table',
    faqTable: 'FAQ Table'
};

// Store pricing data globally for floor plan tabs
let pricingDataCache = {};

async function fetchAirtableData(tableName) {
    // If placeholders are still present, use fallback
    if (AIRTABLE_CONFIG.apiKey.includes('YOUR_TOKEN') || AIRTABLE_CONFIG.baseId.includes('YOUR_BASE_ID')) {
        return getFallbackData(tableName);
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(tableName)}`;
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_CONFIG.apiKey}`
            }
        });

        if (!response.ok) throw new Error(`Airtable API error: ${response.status}`);

        const data = await response.json();
        return data.records;
    } catch (error) {
        console.error(`❌ Error fetching ${tableName}:`, error);
        return getFallbackData(tableName);
    }
}

function getFallbackData(tableName) {
    if (tableName === AIRTABLE_CONFIG.pricingTable) {
        // Matches your Airtable fields: Unit Type, Current Price, Promotions
        return [
            { fields: { 'Unit Type': 'A - 1 Bedroom', 'Current Price': '$895', 'Promotions': '12% savings over our standard rates = $150 in savings per month' } },
            { fields: { 'Unit Type': 'B - 2 Bedroom', 'Current Price': '$995', 'Promotions': 'Promotion 30% sale on our standard rate. End soon!' } },
            { fields: { 'Unit Type': 'C - 1 Bedroom', 'Current Price': '$1,045', 'Promotions': 'Promotion 30% sale on our standard rate. End soon!' } },
            { fields: { 'Unit Type': 'D - 1 Bedroom ADA', 'Current Price': '$1,200', 'Promotions': 'Promotion 30% sale on our standard rate. End soon!' } },
            { fields: { 'Unit Type': 'R - 1 Bedroom', 'Current Price': '$1,300', 'Promotions': 'Promotion 30% sale on our standard rate. End soon!' } }
        ];
    }
    // FAQ fallback - matches your Airtable fields: Question, Answer
    return [
        { fields: { Question: 'How much does parking cost?', Answer: 'Underground garage parking is included with your lease at no additional cost.' } },
        { fields: { Question: 'What utilities are included?', Answer: 'You pay for what is used. Electric, gas, water, and internet are tenant responsibilities.' } },
        { fields: { Question: 'Are pets allowed?', Answer: 'Yes! We welcome cats and dogs. A pet deposit and monthly pet rent apply.' } },
        { fields: { Question: 'How far is it to Grant Medical Center?', Answer: 'A 3-minute walk (0.2 miles) to Trinity Regional Medical Center.' } },
        { fields: { Question: 'Is there a gym or fitness center?', Answer: 'No - and that\'s intentional. We focus on privacy and low fees, not amenities you pay for but don\'t use.' } },
        { fields: { Question: 'Is there in-unit laundry?', Answer: 'Units have access to on-site laundry facilities. Select units feature in-unit washer/dryer hookups.' } },
        { fields: { Question: 'What\'s the application process?', Answer: 'Schedule a tour, fall in love, apply online. We run credit and background checks. Approval typically takes 24-48 hours.' } }
    ];
}

// Build pricing cache keyed by unit type
function buildPricingCache(records) {
    records.forEach(record => {
        const unitType = record.fields['Unit Type'];
        if (unitType) {
            pricingDataCache[unitType] = {
                price: record.fields['Current Price'] || '',
                promotions: record.fields['Promotions'] || ''
            };
        }
    });
}

// Render pricing caption in floor plan tabs
function renderFloorPlanPricing() {
    const unitMapping = {
        'type-a': 'A - 1 Bedroom',
        'type-b': 'B - 2 Bedroom',
        'type-c': 'C - 1 Bedroom',
        'type-d': 'D - 1 Bedroom ADA',
        'type-r': 'R - 1 Bedroom'
    };

    Object.entries(unitMapping).forEach(([tabId, unitType]) => {
        const panel = document.getElementById(tabId);
        if (!panel) return;

        const pricing = pricingDataCache[unitType];
        if (!pricing) return;

        // Check if caption already exists
        let caption = panel.querySelector('.floor-plan-caption');
        if (!caption) {
            caption = document.createElement('div');
            caption.className = 'floor-plan-caption';
            panel.appendChild(caption);
        }

        const smsBody = `Hi, I'm interested in your Apartments at 2nd Ave, I saw unit type ${unitType}, is currently leasing at ${pricing.price} per month. My name is:`;
        const smsLink = `sms:+15154000376?body=${encodeURIComponent(smsBody)}`;

        caption.innerHTML = `
            <div class="pricing-info">
                <span class="price">${pricing.price}<span class="price-period">/month</span></span>
                ${pricing.promotions ? `<span class="promo">${pricing.promotions}</span>` : ''}
                <a href="${smsLink}" class="btn btn-gold-outline" data-lead-source="floor-plan-${unitType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" style="margin-top: 1rem;">
                    Text Us About This Unit
                </a>
            </div>
        `;
    });
}

function renderFAQ(records) {
    const container = document.getElementById('faq-container');
    if (!container) return;

    container.innerHTML = records.map(record => `
        <div class="faq-item reveal">
            <div class="faq-question">
                <h3>${record.fields.Question}</h3>
                <span class="faq-toggle">+</span>
            </div>
            <div class="faq-answer">
                <p>${record.fields.Answer}</p>
            </div>
        </div>
    `).join('');

    // Add FAQ toggle logic
    container.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            item.classList.toggle('active');
            const toggle = q.querySelector('.faq-toggle');
            toggle.textContent = item.classList.contains('active') ? '−' : '+';
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('%c 2nd Avenue Rowhomes V2.2 %c Airtable Integration ', 'background: #1a1a1a; color: #f0c040; padding: 5px; border-radius: 3px 0 0 3px;', 'background: #f0c040; color: #1a1a1a; padding: 5px; border-radius: 0 3px 3px 0;');

    // Fetch and cache pricing data
    const pricingData = await fetchAirtableData(AIRTABLE_CONFIG.pricingTable);
    buildPricingCache(pricingData);
    renderFloorPlanPricing();

    // Fetch and render FAQ
    const faqData = await fetchAirtableData(AIRTABLE_CONFIG.faqTable);
    renderFAQ(faqData);

    // Initial check for scroll reveal
    window.dispatchEvent(new Event('scroll'));
});
