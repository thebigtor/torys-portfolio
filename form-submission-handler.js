(function() {
  // get all data in form and return object
  function getFormData(form) {
    var elements = form.elements;
    var honeypot;

    var fields = Object.keys(elements).filter(function(k) {
      if (elements[k].name === "honeypot") {
        honeypot = elements[k].value;
        return false;
      }
      return true;
    }).map(function(k) {
      if(elements[k].name !== undefined) {
        return elements[k].name;
      // special case for Edge's html collection
      }else if(elements[k].length > 0){
        return elements[k].item(0).name;
      }
    }).filter(function(item, pos, self) {
      return self.indexOf(item) == pos && item;
    });

    var formData = {};
    fields.forEach(function(name){
      var element = elements[name];
      
      // singular form elements just have one value
      formData[name] = element.value;

      // when our element has multiple items, get their values
      if (element.length) {
        var data = [];
        for (var i = 0; i < element.length; i++) {
          var item = element.item(i);
          if (item.checked || item.selected) {
            data.push(item.value);
          }
        }
        formData[name] = data.join(', ');
      }
    });

    // add form-specific values into the data
    formData.formDataNameOrder = JSON.stringify(fields);
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
    formData.formGoogleSendEmail
      = form.dataset.email || ""; // no email by default

    return {data: formData, honeypot: honeypot};
  }

  function handleFormSubmit(event) {  
    event.preventDefault();          
    var form = event.target;
    var formData = getFormData(form);
    var data = formData.data;

    // If a honeypot field is filled, assume it was done so by a spam bot.
    if (formData.honeypot) {
      return false;
    }

    // Show loading state immediately
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = "Sending...";
    
    // Show notification with sending message immediately
    const notification = document.getElementById('notification');
    notification.querySelector('p').textContent = "Sending your message...";
    notification.classList.add('show');

    disableAllButtons(form);
    var url = form.action;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            form.reset();
            
            // Update notification after successful submission
            showNotification("Thank you! Your message has been submitted.");
          } else {
            // Handle error
            showNotification("Something went wrong. Please try again.", true);
          }
          
          // Reset button state
          submitButton.textContent = originalText;
        }
    };
    
    // url encode form data for sending as post data
    var encoded = Object.keys(data).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
    }).join('&');
    xhr.send(encoded);
  }
  
  function loaded() {
    // bind to the submit event of our form
    var forms = document.querySelectorAll("form.gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit, false);
    }
  };
  
  document.addEventListener("DOMContentLoaded", loaded, false);

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }

  function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const notificationText = notification.querySelector('p');
    
    // Set the message
    notificationText.textContent = message;
    
    // Style based on error status
    if (isError) {
        notification.style.borderLeftColor = '#ff3a3a'; // Red for errors
    } else {
        notification.style.borderLeftColor = '#3a86ff'; // Blue for success
    }
    
    // Reset any previous animation
    notification.classList.remove('sliding-up');
    
    // Force browser to recognize the element's current position before animating
    void notification.offsetWidth; // This triggers a reflow
    
    // Add the show class to trigger the slide-in animation
    notification.classList.add('show');
    
    // Hide notification after delay
    setTimeout(function() {
        // Slide up animation
        notification.classList.add('sliding-up');
        
        // After animation completes, reset everything
        setTimeout(function() {
            notification.classList.remove('show');
            notification.classList.remove('sliding-up');
        }, 500); // Match this to your CSS transition time
    }, 3000);
}
})();
