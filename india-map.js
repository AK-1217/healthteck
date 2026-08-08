/**
 * india-map.js — India States Selector
 *
 * Replaces the interactive map with a simple dropdown selector of all
 * Indian states & union territories. Selecting a state displays its
 * healthcare infrastructure details (capital, region, population,
 * hospitals, health centres, AYUSH colleges and heritage info).
 */

(function () {
    "use strict";

    // ---- State / UT data (same dataset as the previous map) ----
    const STATES = [
        { id: "jk", name: "Jammu & Kashmir", short: "J&K", region: "North", capital: "Srinagar (S), Jammu (W)", population: 13.6, hospitals: 150, centres: 310, colleges: 6, ayushClinics: 95, beds: 4200, districts: 20, literacy: 67.2, herbs: "Saffron, Kutki, Bhringraj, Vacha", heritage: "Kashmir is the cradle of ancient Ayurveda — the Niramandu temple tradition and the Charaka connection make this a historically significant Ayurvedic region." },
        { id: "ladakh", name: "Ladakh", short: "LD", region: "North", capital: "Leh", population: 0.3, hospitals: 40, centres: 90, colleges: 1, ayushClinics: 18, beds: 600, districts: 2, literacy: 66.7, herbs: "Sea Buckthorn, Rhodiola, Gentiana", heritage: "High-altitude Sowa-Rigpa (Tibetan medicine) and Amchi tradition thrive here alongside Ayurveda." },
        { id: "hp", name: "Himachal Pradesh", short: "HP", region: "North", capital: "Shimla", population: 7.5, hospitals: 120, centres: 240, colleges: 2, ayushClinics: 55, beds: 1800, districts: 12, literacy: 82.8, herbs: "Kutki, Chora, Tagar, Jatamansi", heritage: "Known for medicinal herb-rich Himalayan forests; home to the CSIR-IHBT institute at Palampur." },
        { id: "pb", name: "Punjab", short: "PB", region: "North", capital: "Chandigarh", population: 30.0, hospitals: 200, centres: 420, colleges: 3, ayushClinics: 110, beds: 5200, districts: 23, literacy: 75.8, herbs: "Isabgol, Ashwagandha, Brahmi, Shatavari", heritage: "Strong Unani and Ayurveda tradition; Ludhiana's Ayurvedic colleges serve the wider region." },
        { id: "uk", name: "Uttarakhand", short: "UK", region: "North", capital: "Dehradun (W), Gairsain (S)", population: 11.1, hospitals: 110, centres: 220, colleges: 4, ayushClinics: 70, beds: 2600, districts: 13, literacy: 78.8, herbs: "Kutki, Jatamansi, Guggul, Haritaki", heritage: "The land of Charaka — believed birthplace of the great Ayurvedic physician; a hub of herbal biodiversity and Patanjali's headquarters." },
        { id: "hr", name: "Haryana", short: "HR", region: "North", capital: "Chandigarh", population: 29.4, hospitals: 180, centres: 380, colleges: 5, ayushClinics: 90, beds: 4800, districts: 22, literacy: 75.6, herbs: "Ashwagandha, Giloy, Amla, Tulsi", heritage: "The Kurukshetra region is mentioned in Ayurvedic lore; a growing centre for AYUSH medical education." },
        { id: "dl", name: "Delhi", short: "DL", region: "North", capital: "New Delhi", population: 21.8, hospitals: 260, centres: 550, colleges: 4, ayushClinics: 120, beds: 6800, districts: 11, literacy: 86.2, herbs: "Amla, Giloy, Ashwagandha, Neem", heritage: "National capital hosts the Ministry of AYUSH and premier institutes like NIA and AIIA." },
        { id: "ch", name: "Chandigarh", short: "CH", region: "North", capital: "Chandigarh", population: 1.2, hospitals: 12, centres: 25, colleges: 1, ayushClinics: 8, beds: 350, districts: 1, literacy: 86.4, herbs: "Brahmi, Ashwagandha, Tulsi", heritage: "Union territory known for its planned layout and modern AYUSH clinic network." },
        { id: "up", name: "Uttar Pradesh", short: "UP", region: "North", capital: "Lucknow", population: 234.9, hospitals: 350, centres: 720, colleges: 14, ayushClinics: 210, beds: 9800, districts: 75, literacy: 67.7, herbs: "Amla, Haritaki, Giloy, Ashwagandha", heritage: "Varanasi (Kashi) is a timeless seat of Ayurveda learning; hosts the Banaras Hindu University tradition." },
        { id: "br", name: "Bihar", short: "BR", region: "East", capital: "Patna", population: 128.0, hospitals: 230, centres: 610, colleges: 8, ayushClinics: 140, beds: 7200, districts: 38, literacy: 61.8, herbs: "Brahmi, Shankhpushpi, Amla, Neem", heritage: "Nalanda's ancient universities nurtured Ayurvedic scholarship; strong tradition of herbal medicine in Mithila." },
        { id: "wb", name: "West Bengal", short: "WB", region: "East", capital: "Kolkata", population: 101.0, hospitals: 290, centres: 640, colleges: 10, ayushClinics: 160, beds: 8500, districts: 23, literacy: 76.3, herbs: "Kutki, Ashwagandha, Brahmi, Vasaka", heritage: "Calcutta (Kolkata) was a pioneer of formal Ayurvedic education; home to the Surjyakumar Goode Memorial Ayurvedic college legacy." },
        { id: "jh", name: "Jharkhand", short: "JH", region: "East", capital: "Ranchi", population: 38.9, hospitals: 140, centres: 340, colleges: 3, ayushClinics: 75, beds: 3800, districts: 24, literacy: 66.4, herbs: "Kalmegh, Guduchi, Bhringraj, Sarpagandha", heritage: "Rich in tribal medicinal knowledge and forest herbs; Sarna healing traditions complement Ayurveda." },
        { id: "od", name: "Odisha", short: "OD", region: "East", capital: "Bhubaneswar", population: 45.4, hospitals: 200, centres: 460, colleges: 6, ayushClinics: 110, beds: 5600, districts: 30, literacy: 72.9, herbs: "Brahmi, Amla, Haritaki, Guggul", heritage: "Puri's Jagannath tradition uses herbal Prasad; coastal flora offers unique medicinal resources." },
        { id: "cg", name: "Chhattisgarh", short: "CG", region: "Central", capital: "Raipur", population: 30.3, hospitals: 160, centres: 380, colleges: 4, ayushClinics: 85, beds: 4200, districts: 28, literacy: 70.3, herbs: "Kalmegh, Guduchi, Sarpagandha, Bhringraj", heritage: "The 'Herbal State' of India with vast forest cover; tribal medicine knowledge is extensively documented." },
        { id: "sk", name: "Sikkim", short: "SK", region: "Northeast", capital: "Gangtok", population: 0.7, hospitals: 30, centres: 70, colleges: 1, ayushClinics: 12, beds: 500, districts: 4, literacy: 81.4, herbs: "Rhodiola, Kutki, Chiraito, Saussurea", heritage: "Blend of Sowa-Rigpa, Ayurveda and organic medicinal farming in the Himalayan belt." },
        { id: "ar", name: "Arunachal Pradesh", short: "AR", region: "Northeast", capital: "Itanagar", population: 1.6, hospitals: 50, centres: 110, colleges: 1, ayushClinics: 20, beds: 800, districts: 26, literacy: 65.4, herbs: "Aconite, Kutki, Chiraito, Rhodiola", heritage: "Indigenous healing systems of the Monpa and other tribes; rich medicinal plant diversity." },
        { id: "as", name: "Assam", short: "AS", region: "Northeast", capital: "Dispur", population: 36.2, hospitals: 160, centres: 330, colleges: 4, ayushClinics: 80, beds: 4200, districts: 35, literacy: 72.2, herbs: "Brahmi, Vasaka, Kalmegh, Amla", heritage: "The Brahmaputra valley is famous for traditional herbal healing and the Assam type of Ayurveda." },
        { id: "nl", name: "Nagaland", short: "NL", region: "Northeast", capital: "Kohima", population: 2.2, hospitals: 45, centres: 100, colleges: 1, ayushClinics: 15, beds: 600, districts: 16, literacy: 79.6, herbs: "Aconite, Kutki, Chiraito, Gentiana", heritage: "Naga tribal medicine and botanical remedies preserved through community knowledge." },
        { id: "ml", name: "Meghalaya", short: "ML", region: "Northeast", capital: "Shillong", population: 3.4, hospitals: 55, centres: 120, colleges: 1, ayushClinics: 18, beds: 700, districts: 12, literacy: 74.4, herbs: "Kalmegh, Vasaka, Brahmi, Amla", heritage: "Rainforest ecology supports unique medicinal flora used by the Khasi community." },
        { id: "mn", name: "Manipur", short: "MN", region: "Northeast", capital: "Imphal", population: 3.1, hospitals: 60, centres: 130, colleges: 2, ayushClinics: 20, beds: 800, districts: 16, literacy: 76.9, herbs: "Aconite, Kutki, Chiraito, Saussurea", heritage: "Home of the classical Meitei healing tradition and distinct herbal pharmacopoeia." },
        { id: "mz", name: "Mizoram", short: "MZ", region: "Northeast", capital: "Aizawl", population: 1.2, hospitals: 40, centres: 90, colleges: 1, ayushClinics: 12, beds: 500, districts: 11, literacy: 91.3, herbs: "Kalmegh, Vasaka, Brahmi, Amla", heritage: "Mizo indigenous medicine with strong reliance on forest botanicals." },
        { id: "tr", name: "Tripura", short: "TR", region: "Northeast", capital: "Agartala", population: 4.1, hospitals: 70, centres: 150, colleges: 1, ayushClinics: 25, beds: 900, districts: 8, literacy: 87.2, herbs: "Brahmi, Vasaka, Kalmegh, Amla", heritage: "Bengali Ayurvedic influence blended with Tripuri tribal healing practices." },
        { id: "rj", name: "Rajasthan", short: "RJ", region: "North", capital: "Jaipur", population: 81.0, hospitals: 240, centres: 500, colleges: 9, ayushClinics: 130, beds: 6800, districts: 33, literacy: 66.1, herbs: "Rohitaka, Ashwagandha, Guggul, Amla", heritage: "Desert herbs like Rohitaka and historical Unani courts of the Rajput era." },
        { id: "gj", name: "Gujarat", short: "GJ", region: "West", capital: "Gandhinagar", population: 64.0, hospitals: 250, centres: 520, colleges: 11, ayushClinics: 140, beds: 7200, districts: 33, literacy: 78.0, herbs: "Ashwagandha, Guggul, Amla, Shatavari", heritage: "Jamnagar's Gujarat Ayurveda University is a world-renowned centre for Ayurvedic education and research." },
        { id: "dn", name: "Dadra & Nagar Haveli and Daman & Diu", short: "DN", region: "West", capital: "Silvassa", population: 0.6, hospitals: 10, centres: 20, colleges: 1, ayushClinics: 5, beds: 200, districts: 3, literacy: 77.6, herbs: "Amla, Giloy, Tulsi, Neem", heritage: "Small western UT with an evolving AYUSH health infrastructure." },
        { id: "mp", name: "Madhya Pradesh", short: "MP", region: "Central", capital: "Bhopal", population: 85.4, hospitals: 240, centres: 520, colleges: 9, ayushClinics: 130, beds: 6800, districts: 52, literacy: 69.3, herbs: "Kalmegh, Guduchi, Sarpagandha, Bhringraj", heritage: "Heart of India with dense herbal forests; the Sanjeevani legend is linked to these hills." },
        { id: "mh", name: "Maharashtra", short: "MH", region: "West", capital: "Mumbai", population: 126.0, hospitals: 380, centres: 760, colleges: 13, ayushClinics: 200, beds: 10500, districts: 36, literacy: 82.3, herbs: "Ashwagandha, Guggul, Amla, Shatavari", heritage: "Pune and Nagpur host leading Ayurveda colleges; a strong Ashtang-Hridaya scholarly tradition." },
        { id: "ga", name: "Goa", short: "GA", region: "West", capital: "Panaji", population: 1.6, hospitals: 30, centres: 60, colleges: 1, ayushClinics: 10, beds: 400, districts: 2, literacy: 88.7, herbs: "Amla, Giloy, Tulsi, Neem", heritage: "Coastal herbs and Portuguese-era medicinal garden traditions complement Ayurveda." },
        { id: "tg", name: "Telangana", short: "TG", region: "South", capital: "Hyderabad", population: 39.4, hospitals: 220, centres: 450, colleges: 7, ayushClinics: 110, beds: 5800, districts: 33, literacy: 72.8, herbs: "Ashwagandha, Guggul, Amla, Shatavari", heritage: "Hyderabad has a historic Unani and Ayurveda heritage under the Nizams' patronage." },
        { id: "ap", name: "Andhra Pradesh", short: "AP", region: "South", capital: "Amaravati", population: 54.0, hospitals: 240, centres: 520, colleges: 8, ayushClinics: 120, beds: 6200, districts: 26, literacy: 67.0, herbs: "Ashwagandha, Guggul, Amla, Shatavari", heritage: "Tirupati's SV Ayurvedic college and rich coastal medicinal plant resources." },
        { id: "ka", name: "Karnataka", short: "KA", region: "South", capital: "Bengaluru", population: 68.0, hospitals: 300, centres: 620, colleges: 12, ayushClinics: 160, beds: 8200, districts: 31, literacy: 75.4, herbs: "Ashwagandha, Guggul, Amla, Shatavari", heritage: "Mysuru region is famed for classical Ayurveda practice and the Dhanvantari tradition." },
        { id: "tn", name: "Tamil Nadu", short: "TN", region: "South", capital: "Chennai", population: 77.8, hospitals: 320, centres: 680, colleges: 15, ayushClinics: 180, beds: 9200, districts: 38, literacy: 80.1, herbs: "Ashwagandha, Guggul, Amla, Shatavari", heritage: "Cradle of the Siddha system; Chennai hosts the Central Council for Research in Siddha." },
        { id: "kl", name: "Kerala", short: "KL", region: "South", capital: "Thiruvananthapuram", population: 36.0, hospitals: 220, centres: 470, colleges: 8, ayushClinics: 120, beds: 6200, districts: 14, literacy: 96.2, herbs: "Ashwagandha, Guggul, Amla, Shatavari", heritage: "World-famous for authentic Ayurveda Panchakarma and the Kerala school of Vaidyas." },
        { id: "py", name: "Puducherry", short: "PY", region: "South", capital: "Puducherry", population: 1.6, hospitals: 15, centres: 30, colleges: 2, ayushClinics: 8, beds: 350, districts: 4, literacy: 85.8, herbs: "Amla, Giloy, Tulsi, Neem", heritage: "Union territory with a unique blend of Tamil Siddha and French-era health institutions." },
        { id: "ld", name: "Lakshadweep", short: "LD", region: "South", capital: "Kavaratti", population: 0.06, hospitals: 8, centres: 15, colleges: 1, ayushClinics: 3, beds: 100, districts: 1, literacy: 91.8, herbs: "Coconut, Aloe Vera, Neem, Tulsi", heritage: "Island territory with coconut-based traditional remedies and coral-island pharmacopeia." },
        { id: "an", name: "Andaman & Nicobar Islands", short: "AN", region: "South", capital: "Port Blair", population: 0.4, hospitals: 15, centres: 30, colleges: 1, ayushClinics: 5, beds: 200, districts: 3, literacy: 86.6, herbs: "Amla, Giloy, Tulsi, Neem", heritage: "Isolated archipelago with indigenous Onge and Jarawa healing knowledge; tropical medicinal flora." },
    ];

    // ---- DOM references ----
    const selectEl = document.getElementById("stateSelect");
    const detailsEl = document.getElementById("stateDetails");

    if (!selectEl || !detailsEl) {
        return;
    }

    // ---- Populate the dropdown (sorted alphabetically by name) ----
    const sorted = STATES.slice().sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach((state) => {
        const option = document.createElement("option");
        option.value = state.id;
        option.textContent = state.name;
        selectEl.appendChild(option);
    });

    // ---- Build & show the details panel ----
    function showDetails(state) {
        detailsEl.hidden = false;
        detailsEl.innerHTML =
            '<div class="state-details-head">' +
            "<h3>" + state.name + "</h3>" +
            '<span class="state-region">' + state.region + "</span>" +
            "</div>" +
            "<p class=\"state-heritage\">" + state.heritage + "</p>" +
            '<div class="state-stats">' +
            '<div class="state-stat"><strong>' + state.hospitals + "</strong><span>Hospitals</span></div>" +
            '<div class="state-stat"><strong>' + state.centres + "</strong><span>Health Centres</span></div>" +
            '<div class="state-stat"><strong>' + state.ayushClinics + "</strong><span>AYUSH Clinics</span></div>" +
            '<div class="state-stat"><strong>' + state.beds + "</strong><span>Hospital Beds</span></div>" +
            '<div class="state-stat"><strong>' + state.colleges + "</strong><span>Healthtech Colleges</span></div>" +
            "</div>" +
            '<ul class="state-meta">' +
            "<li><strong>Capital:</strong> " + state.capital + "</li>" +
            "<li><strong>Region:</strong> " + state.region + "</li>" +
            "<li><strong>Population:</strong> " + state.population + " million</li>" +
            "<li><strong>Districts:</strong> " + state.districts + "</li>" +
            "<li><strong>Literacy:</strong> " + state.literacy + "%</li>" +
            "<li><strong>Key Medicinal Herbs:</strong> " + state.herbs + "</li>" +
            "</ul>";

        detailsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // ---- Handle selection ----
    selectEl.addEventListener("change", () => {
        const id = selectEl.value;
        if (!id) {
            detailsEl.hidden = true;
            detailsEl.innerHTML = "";
            return;
        }
        const state = STATES.find((s) => s.id === id);
        if (state) showDetails(state);
    });
})();

