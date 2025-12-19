// Event Tracking for SMS Lead Sources
document.querySelectorAll('a[href^="sms:"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const source = link.getAttribute('data-lead-source') || 'unknown';
        const destination = link.getAttribute('href');
        console.group(`🚀 Lead Source Triggered: ${source.toUpperCase()}`);
        console.log(`Target: ${destination}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.groupEnd();

        // Potential GA4/GTM push:
        // window.dataLayer = window.dataLayer || [];
        // window.dataLayer.push({'event': 'sms_lead', 'source': source});
    });
});

// Airtable Integration
const AIRTABLE_CONFIG = {
    apiKey: 'pat.YOUR_TOKEN',
    baseId: 'app.YOUR_BASE_ID',
    pricingTable: 'Pricing Table',
    faqTable: 'FAQ Table'
};

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
        return [
            {
                fields: {
                    Name: '1BR Urban Base',
                    Size: '572 SQ FT',
                    Price: '$1,200/mo',
                    Availability: 'Immediate',
                    SMS: "Hi, I'm interested in the 1-bedroom urban base at 2nd Ave."
                }
            },
            {
                fields: {
                    Name: '2BR Rowhome',
                    Size: '1,088 SQ FT',
                    Price: '$1,800/mo',
                    Availability: 'Waitlist',
                    SMS: "Hi, I'm interested in the 2-bedroom rowhome at 2nd Ave."
                }
            }
        ];
    }
    return [
        {
            fields: {
                Question: 'What is the "Privacy Premium"?',
                Answer: 'It means zero shared hallways. Your front door leads directly outside, giving you the privacy of a house with the convenience of an apartment.'
            }
        },
        {
            fields: {
                Question: 'What is the best housing near UnityPoint Health for traveling nurses?',
                Answer: '2nd Avenue Rowhomes is exactly 1.0 mile from Trinity Regional Medical Center (UnityPoint Health). Our private-entry design eliminates hallway noise, making it the quietest sanctuary for healthcare professionals after a long shift.'
            }
        },
        {
            fields: {
                Question: 'Where do Cargill and Koch Industries employees live in Fort Dodge?',
                Answer: 'Many industrial specialists choose 2nd Avenue Rowhomes for its proximity to the industrial park and its 2024 construction reliability, which ensures a modern, low-maintenance living experience.'
            }
        },
        {
            fields: {
                Question: 'How close is Trinity Regional Medical Center?',
                Answer: 'We are exactly 3 minutes away by car (1.0 mile), making us the ideal base for healthcare professionals.'
            }
        }
    ];
}

function renderPricing(records) {
    const container = document.getElementById('pricing-container');
    if (!container) return;

    container.innerHTML = records.map(record => `
        <div class="benefit-card glass-card reveal">
            <div class="availability-badge">${record.fields.Availability || 'Available'}</div>
            <h3>${record.fields.Name}</h3>
            <p class="unit-specs">${record.fields.Size} • ${record.fields.Price}</p>
            <a href="sms:+15154000376?body=${encodeURIComponent(record.fields.SMS)}" class="btn btn-primary" data-lead-source="floor-plan-${record.fields.Name.toLowerCase().replace(/\s+/g, '-')}">
                Text About This Unit
            </a>
        </div>
    `).join('');
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
    console.log('%c 2nd Avenue Rowhomes V2.1 %c Relocation Engine Loaded ', 'background: #1a1a1a; color: #f0c040; padding: 5px; border-radius: 3px 0 0 3px;', 'background: #f0c040; color: #1a1a1a; padding: 5px; border-radius: 0 3px 3px 0;');

    const pricingData = await fetchAirtableData(AIRTABLE_CONFIG.pricingTable);
    renderPricing(pricingData);

    const faqData = await fetchAirtableData(AIRTABLE_CONFIG.faqTable);
    renderFAQ(faqData);

    // Initial check for scroll reveal
    window.dispatchEvent(new Event('scroll'));
});
