export const getFormattedDate = () => {
  // Get the current date and time
  let currentDate = new Date();

  // Define arrays for month and day names
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  // Extract components
  let dayName = days[currentDate.getDay()];
  let monthName = months[currentDate.getMonth()];
  let day = currentDate.getDate();
  let year = currentDate.getFullYear();
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();

  // Convert to 12-hour format and determine AM/PM
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Add a leading zero to minutes if needed
  minutes = minutes < 10 ? '0' + minutes : minutes;

  // Create the formatted date string
  return `${dayName}, ${monthName} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
}; 