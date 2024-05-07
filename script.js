let clickCount = 0;

const countryInput = document.getElementById('country');
const countryListInput = document.getElementById('country-list');
const cityInput = document.getElementById('city');
const streetInput = document.getElementById('street');
const countryCodeInput = document.getElementById('countryCode');
const myForm = document.getElementById('form');
const vatUEControl = document.getElementById('vatUE');
const vatNumberControl = document.getElementById('vatNumber');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');
const invoiceControl = document.getElementById('invoiceData');
const submitBtn = document.getElementById('submitBtn');
const requiredFields = [...document.querySelectorAll('input[required]')];
const invoiceData = {
    firstName: '',
    lastName: '',
    street: '',
    zipCode: '',
    city: '',
    country: '',
    vatNumber: ''
};
let countryData;

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

countryInput.addEventListener('change', () => {
    getCountryCode(countryInput.value);
})

vatUEControl.addEventListener('change', () => {
    vatNumberControl.value = vatUEControl.checked ? countryData.cca2 : '';
})

const updateFvData = (key, value) => {
    invoiceData[key] = value;
    invoiceControl.value = `
    ${invoiceData.firstName} ${invoiceData.lastName}
    ${invoiceData.street}
    ${invoiceData.zipCode} ${invoiceData.city}
    ${invoiceData.country}
    ${invoiceData.vatNumber}
    `.trim()
}

const validateData = (control) => {
    if (!control.value.trim()) {
        control.classList.add('error');
    } else {
        control.classList.remove('error');
    }
}

requiredFields.forEach((control) => {
    control.addEventListener('input',() =>  validateData(control));
});

[...document.getElementsByClassName('fv-data-control')].forEach((control) => {
    control.addEventListener('input', () => {
        updateFvData(control.id, control.value);
    })
})


async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();
        const countries = data.map(country => country.name.common).sort();
        countryListInput.innerHTML = countries.map(country => `<option value="${country}">${country}</option>`).join('');
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

function getCountryByIP() {
    return fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            cityInput.value = data.city;
            countryInput.value = country;
            countryCodeInput.value = countryCode;
            updateFvData(countryInput.id, countryInput.value);
            updateFvData(cityInput.id, cityInput.value);
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}

function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        return response.json();
    })
        .then(data => {   
            countryData = data[0];
            const countryCode = `${data[0].idd.root}${data[0].idd.suffixes.length > 1 ? '' : data[0].idd.suffixes[0]}`;
            countryCodeInput.value = countryCode;
    })
    .catch(error => {
        console.error('Wystąpił błąd:', error);
    });
}

document.addEventListener('keyup', (e) => {
    if (e.code === "Enter") {
        submitBtn.click();
    }
  });

submitBtn.addEventListener('click', () => {
    requiredFields.forEach(validateData)
});

(() => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    document.addEventListener('click', handleClick);
    fetchAndFillCountries();  
    getCountryByIP().then(() => {
        getCountryCode(countryInput.value);
        }
    );
})()
