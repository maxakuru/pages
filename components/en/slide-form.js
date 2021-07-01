/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
let formContainer = document.querySelector('.slide-form-container');
let slideBtns = document.querySelectorAll('.slide-btn');
let slideItems = document.querySelectorAll('.slide-form-item');
let progressIndicator = document.querySelector('.progress-indicator span');
let totalAnswers = document.querySelectorAll('.field');
let otherOptionInput = document.querySelectorAll('.other-option-input');
let header = '';
let currentSlide = 0;
const allValues = [];
const collectNames = [];
let totalQuestions = [];

const checkIfDomReady = setInterval(() => {
  if (document.querySelector('.slide-form-container')) {
    formContainer = document.querySelector('.slide-form-container');
    slideBtns = document.querySelectorAll('.slide-btn');
    slideItems = document.querySelectorAll('.slide-form-item');
    progressIndicator = document.querySelector('.progress-indicator span');
    totalAnswers = document.querySelectorAll('.question input');
    otherOptionInput = document.querySelectorAll('.other-option-input');
    header = document.querySelector('main .default:first-of-type').innerHTML;
    setHeader(header);
    setFormContainHeight();
    addOtherInputField();
    clearInterval(checkIfDomReady);
  }
}, 200);

function scrollBackUp() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

function setHeader(content) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `${content}<hr>`;
  document.querySelectorAll('.slide-form-item')[0].prepend(wrap);
  wrap.setAttribute('tabindex', 0);
  document.querySelector('main .default:first-of-type').remove();
}

// ----------------------------------------------
// Store the values into array to manage progress
// ----------------------------------------------

// Get total questions removes duplicated checkbox values
// for progress tracking purposes.
function getTotalQuestions(data) {
  totalQuestions = [];
  for (let i = 0; i < data.length; i++) {
    if (!totalQuestions.includes(data[i])) {
      totalQuestions.push(data[i]);
    }
  }
}

// Collects all input values
// goes through getTotalQuestions() to remove duplicates
function valueStore(event) {
  const currentSelector = event.currentTarget;

  if (currentSelector.getAttribute('type') == 'checkbox') {
    if (currentSelector.checked == true) {
      allValues.push(currentSelector.getAttribute('name'));
    } else {
      allValues.splice(allValues.indexOf(currentSelector.getAttribute('name')), 1);
    }
  }

  if (currentSelector.getAttribute('type') == 'radio') {
    if (!allValues.includes(currentSelector.getAttribute('name'))) {
      allValues.push(currentSelector.getAttribute('name'));
    }
  }

  if (currentSelector.nodeName == 'TEXTAREA') {
    const textArea = event.currentTarget;
    setTimeout(() => {
      updateTextValue(textArea, textArea.value.length);
    });

    function updateTextValue(el, strlen) {
      if (strlen >= 5) {
        if (!allValues.includes(el.getAttribute('name'))) {
          allValues.push(el.getAttribute('name'));
        }
      }

      if (strlen <= 4) {
        if (allValues.includes(el.getAttribute('name'))) {
          allValues.splice(allValues.indexOf(el.getAttribute('name')), 1);
        }
      }
    }
  }

  setTimeout(() => getTotalQuestions(allValues));
}

// Set Indicator Counter
function setIndicator() {
  document.querySelector('.indicator-current').innerHTML = `Page ${1}`;
  document.querySelector('.indicator-total').innerHTML = slideItems.length;
}

// animate form height
function setFormContainHeight() {
  slideItems.forEach((slide) => {
    if (slide.classList.contains('active')) {
      formContainer.style.height = `${slide.offsetHeight}px`;
    }
  });
}

const debounce = function (func, wait, immediate) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Readjust form container height on resize
window.addEventListener('resize', debounce(() => {
  setFormContainHeight();
}, 300));

// Set Sliders and disable/enable next button
function setSlider(count = 0) {
  // Hide back button on first page.
  if (count >= 1) {
    document.querySelector('.prev').style.display = 'inline-block';
  } else {
    document.querySelector('.prev').style.display = 'none';
  }

  document.querySelector('.slide-btn.next').classList.remove('completed');
  slideItems.forEach((slide, index) => {
    slide.classList.remove('active');
    slide.style.transform = `translateX(${index - count}00%)`;
  });
  slideItems[count].classList.add('active');

  progressBarUpdater();

  const currentActiveRequired = slideItems[count].querySelectorAll('.is-required');
  const values = [];

  // Get all required input count
  let required_counter = 0;
  currentActiveRequired.forEach(($el, $in) => {
    required_counter += 1;
  });

  if (required_counter < 1) {
    document.querySelector('.slide-btn.next').classList.add('completed');
  }

  currentActiveRequired.forEach((el, i) => {
    el.querySelectorAll('input, textarea').forEach((field, index) => {
      if (field.getAttribute('type') == 'checkbox' || field.getAttribute('type') == 'radio') {
        if (field.checked == true) {
          values.push(field.getAttribute('name'));
        }

        if (values.length >= required_counter) {
          document.querySelector('.slide-btn.next').classList.add('completed');
        } else {
          document.querySelector('.slide-btn.next').classList.remove('completed');
        }

        field.addEventListener('change', (event) => {
          if (event.currentTarget.checked === true) {
            values.push(event.currentTarget.getAttribute('name'));
          } else {
            values.splice(values.indexOf(event.currentTarget.getAttribute('name')), 1);
          }

          const eachOptions = [];
          for (let i = 0; i < values.length; i++) {
            if (!eachOptions.includes(values[i])) {
              eachOptions.push(values[i]);
            }
          }
          if (eachOptions.length >= required_counter) {
            document.querySelector('.slide-btn.next').classList.add('completed');
          } else {
            document.querySelector('.slide-btn.next').classList.remove('completed');
          }
        });
      }

      if (field.nodeName == 'TEXTAREA' || field.getAttribute('type') == 'text' || field.getAttribute('type') == 'email') {
        if (!field.classList.contains('other-input')) {
          if (field.value.length > 1) {
            values.push(fields.getAttribute('name'));
          }

          if (values.length >= required_counter) {
            document.querySelector('.slide-btn.next').classList.add('completed');
          } else {
            document.querySelector('.slide-btn.next').classList.remove('completed');
          }

          field.addEventListener('keyup', (event) => {
            if (event.currentTarget.value.length > 1) {
              if (!values.includes(event.currentTarget.getAttribute('name'))) {
                values.push(event.currentTarget.getAttribute('name'));
              }
            }

            // if(event.currentTarget.value.length <= 0) {
            //   console.log('here')
            //   values.splice(values.indexOf(event.currentTarget.getAttribute('name')), 1)
            // }

            const eachOptions = [];

            for (let i = 0; i < values.length; i++) {
              if (!eachOptions.includes(values[i])) {
                eachOptions.push(values[i]);
              }
            }

            console.log(eachOptions);
            if (eachOptions.length >= required_counter) {
              console.log('here', required_counter);
              document.querySelector('.slide-btn.next').classList.add('completed');
            } else {
              document.querySelector('.slide-btn.next').classList.remove('completed');
            }
          });
        }
      }
    });
  });
  scrollBackUp();
}

// Handler to slide through forms
function formSlider(event) {
  const btn = event.currentTarget;
  if (btn.classList.contains('prev')) {
    if (currentSlide >= 1) {
      currentSlide -= 1;
    }
  } else if (btn.classList.contains('completed')) {
    if (currentSlide < slideItems.length - 1) {
      currentSlide += 1;
    }
  }
  if (currentSlide >= slideItems.length - 1) {
    document.querySelector('.next').style.display = 'none';
    document.querySelector('.submit').style.display = 'inline';
  } else {
    document.querySelector('.next').style.display = 'inline';
    document.querySelector('.submit').style.display = 'none';
  }
  setSlider(currentSlide);
  setFormContainHeight();
  document.querySelector('.panel-tab').focus();
}

// Update progress counter and progress bar
function progressBarUpdater() {
  document.querySelector('.indicator-current').innerHTML = `Page ${currentSlide + 1}`;
  const allRequiredQuestions = document.querySelectorAll('.is-required').length;
  const percentageCompleted = `${`${(currentSlide + 1) * 100}` / slideItems.length}%`;
  progressIndicator.style.transform = `translateX(${percentageCompleted})`;
}

// Create input fields for "Other" checkboxes
function addOtherInputField() {
  const checkBoxes = document.querySelectorAll("input[type='checkbox']");

  checkBoxes.forEach((checkbox) => {
    if (checkbox.value.toLowerCase() == 'other' || checkbox.value.toLowerCase() == 'prefer to self describe') {
      const parentElement = checkbox.closest('div');
      parentElement.classList.add('has-other');
      const parentHTML = parentElement.innerHTML;
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.classList.add('other-input');
      input.setAttribute('placeholder', 'Please explain');
      parentElement.innerHTML = `
        <div class="other-checkbox-element">${parentHTML}</div>
        <div class="other-input-element">${input.outerHTML}</div>
      `;
    }
  });

  document.querySelectorAll('.other-input').forEach((input) => {
    input.addEventListener('keyup', setOtherCheckboxValue);
  });
}

// Add input value for "other" check
function setOtherCheckboxValue(event) {
  const input = event.currentTarget;
  const originalValue = input.getAttribute('value');
  const parent = input.closest('.has-other');
  const checkbox = parent.querySelector("input[type='checkbox']");

  if (input.value.length > 0) {
    if (checkbox.checked != true) {
      checkbox.click();
    }
    checkbox.setAttribute('value', input.value);
  } else {
    checkbox.setAttribute('value', 'other');
  }
}

setSlider();
setIndicator(currentSlide, totalAnswers.length);

slideBtns.forEach((btn) => {
  btn.addEventListener('click', formSlider);
});

document.querySelectorAll('.is-required input, .is-required textarea').forEach((input) => {
  if (input.getAttribute('type') === 'checkbox' || input.getAttribute('type') == 'radio') {
    input.addEventListener('change', valueStore);
  }

  if (input.nodeName == 'TEXTAREA') {
    input.addEventListener('keyup', valueStore);
  }
});
