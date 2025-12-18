// Event Tracking for SMS Lead Sources
document.querySelectorAll('a[href^="sms:"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const source = link.getAttribute('data-lead-source') || 'sticky-footer';
        console.log(`Lead Source Triggered: ${source}`);
        // Integration for actual tracking (e.g. GA4) could be added here
    });
});

// Airtable Integration placeholders
const AIRTABLE_CONFIG = {
    apiKey: 'pat.YOUR_TOKEN', // Placeholder
    baseId: 'app.YOUR_BASE_ID', // Placeholder
    pricingTable: 'Pricing Table',
    faqTable: 'FAQ Table'
};

async function fetchAirtableData(tableName) {
    if (AIRTABLE_CONFIG.apiKey.includes('YOUR_TOKEN')) {
        console.warn('Airtable API Key not set. Using fallback data.');
        return getFallbackData(tableName);
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(tableName)}`;
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_CONFIG.apiKey}`
            }
        });
        const data = await response.json();
        return data.records;
    } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return getFallbackData(tableName);
    }
}

function getFallbackData(tableName) {
    if (tableName === AIRTABLE_CONFIG.pricingTable) {
        return [
            { fields: { Name: '1BR Urban Base', Size: '572 sq ft', Price: '$1,200', SMS: "Hi, I'm interested in the 1-bedroom urban base." } },
            { fields: { Name: '2BR Rowhome', Size: '1,088 sq ft', Price: '$1,800', SMS: "Hi, I'm interested in the 2-bedroom rowhome." } }
        ];
    }
    return [
        { fields: { Question: 'What makes 2nd Avenue Rowhomes the quietest apartments in Fort Dodge?', Answer: 'Our "rowhome" design eliminates shared indoor hallways and common areas.' } }
    ];
}

function renderPricing(records) {
    const container = document.getElementById('pricing-container');
    if (!container) return;
    container.innerHTML = records.map(record => `
        <div class="benefit-card glass-card">
            <h3>${record.fields.Name}</h3>
            <p>${record.fields.Size} | ${record.fields.Price}</p>
            <a href="sms:+15154000376?body=${encodeURIComponent(record.fields.SMS)}" class="btn btn-primary" data-lead-source="floor-plan">
                Text About This Unit
            </a>
        </div>
    `).join('');
}

function renderFAQ(records) {
    const container = document.getElementById('faq-container');
    if (!container) return;
    container.innerHTML = records.map(record => `
        <div class="faq-item" style="margin-bottom: var(--space-md); text-align: left;">
            <h3 style="color: var(--primary); margin-bottom: var(--space-xs);">${record.fields.Question}</h3>
            <p>${record.fields.Answer}</p>
        </div>
    `).join('');
}

// Initialize components
document.addEventListener('DOMContentLoaded', async () => {
    console.log('2nd Avenue Rowhomes V2.0 Initialized');

    const pricingData = await fetchAirtableData(AIRTABLE_CONFIG.pricingTable);
    renderPricing(pricingData);

    const faqData = await fetchAirtableData(AIRTABLE_CONFIG.faqTable);
    renderFAQ(faqData);
});
