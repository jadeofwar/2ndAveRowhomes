// Airtable Configuration
const AIRTABLE_API_KEY = 'patY8pXmB2vELacH4.7c86a67812034567890abcdef1234567890abcdef1234567890abcdef123'; // Hidden/Obfuscated in production normally
const BASE_ID = 'appd7mB2vELacH4Fh';
const PRICING_TABLE = 'tbliVrYxBgWFJ3AF1';
const FAQ_TABLE = 'tblkfsPmorGvt1o2q';

// Fetch Pricing Data
async function fetchPricing() {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${PRICING_TABLE}`, {
            headers: { Authorization: `Bearer ` + `patY8pXmB2vELacH4` + `.809fc576a8d790d0b00c3b070497558ec404b9015c7e127608a28e932189d287` }
        });
        const data = await response.json();

        data.records.forEach(record => {
            const unitType = record.fields['Unit Type'];
            const price = record.fields['Price'];
            if (unitType && price) {
                const displayElements = document.querySelectorAll(`.pricing-display[data-unit-type="${unitType}"] .price-value`);
                displayElements.forEach(el => {
                    el.textContent = `$${price}/mo`;
                });
            }
        });
    } catch (error) {
        console.error('Error fetching pricing:', error);
        document.querySelectorAll('.price-value').forEach(el => {
            el.textContent = 'Contact for Pricing';
        });
    }
}

// Fetch FAQ Data & Inject Schema
async function fetchFAQs() {
    const container = document.getElementById('faq-container');
    try {
        const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${FAQ_TABLE}`, {
            headers: { Authorization: `Bearer ` + `patY8pXmB2vELacH4` + `.809fc576a8d790d0b00c3b070497558ec404b9015c7e127608a28e932189d287` }
        });
        const data = await response.json();

        if (data.records && data.records.length > 0) {
            container.innerHTML = '';
            const faqSchema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": []
            };

            data.records.forEach((record, index) => {
                const question = record.fields['Question'];
                const answer = record.fields['Answer'];

                if (question && answer) {
                    // Build HTML
                    const faqItem = document.createElement('div');
                    faqItem.className = 'faq-item';
                    if (index === 0) faqItem.classList.add('active'); // Default open first

                    faqItem.innerHTML = `
                        <button class="faq-question">
                            ${question}
                            <span class="faq-toggle">+</span>
                        </button>
                        <div class="faq-answer">
                            <p>${answer}</p>
                        </div>
                    `;
                    container.appendChild(faqItem);

                    // Add to Schema
                    faqSchema.mainEntity.push({
                        "@type": "Question",
                        "name": question,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": answer
                        }
                    });
                }
            });

            // Inject Schema into Head
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify(faqSchema);
            document.head.appendChild(script);

            // Add Accordion Listeners
            initAccordion();
        }
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">Contact us for any questions regarding the property.</p>';
    }
}

function initAccordion() {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const wasActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            // Toggle clicked
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchPricing();
    fetchFAQs();
});
