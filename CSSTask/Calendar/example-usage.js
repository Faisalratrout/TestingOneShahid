// Example usage of the enhanced Event class with date ranges
import Event from './event.js';

// Create an event that spans the entire year 2025
const yearLongEvent = new Event(
    "Year 2025 Project",           // title
    "2025-01-01",                  // start date (January 1, 2025)
    "A project spanning the entire year 2025", // description
    "work",                        // category
    "high",                        // priority
    "2025-12-31"                   // end date (December 31, 2025)
);

console.log("Event created:");
console.log("Title:", yearLongEvent.title);
console.log("Start Date:", yearLongEvent.date);
console.log("End Date:", yearLongEvent.endDate);
console.log("Duration in days:", yearLongEvent.getDurationInDays());
console.log("Is multi-day event:", yearLongEvent.isMultiDay());
console.log("Formatted date range:", yearLongEvent.getFormattedDate('long'));

// Alternative way to set the date range after creation
const anotherEvent = new Event("Another Event", "2025-01-01");
anotherEvent.setDateRange("2025-01-01", "2025-12-31");

console.log("\nSecond event:");
console.log("Duration in days:", anotherEvent.getDurationInDays());

// Validation
const validation = yearLongEvent.validate();
console.log("\nValidation result:", validation);

// JSON serialization
console.log("\nJSON representation:");
console.log(JSON.stringify(yearLongEvent.toJSON(), null, 2));
