document.addEventListener('keydown', function(event) {
  if (isTabletDevice() && event.shiftKey && event.key === 'Shift') {
    // Right shift key is being held down on a tablet device
    // Perform the desired action or trigger the right-click event
    event.preventDefault(); // Prevent the default shift key behavior if needed
    
    // Example: Trigger a custom right-click event on the target element
    var targetElement = event.target;
    var customRightClickEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 2,
      buttons: 2,
      clientX: targetElement.getBoundingClientRect().left,
      clientY: targetElement.getBoundingClientRect().top
    });
    targetElement.dispatchEvent(customRightClickEvent);
  }
});

function isTabletDevice() {
  var userAgent = navigator.userAgent.toLowerCase();
  console.log('User Agent:', userAgent); // Log the user agent string
  return /ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(userAgent);
}