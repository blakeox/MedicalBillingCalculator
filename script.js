document.addEventListener('DOMContentLoaded', () => {
    let rowCount = 1;

    document.getElementById('addRowBtn').addEventListener('click', addRow);
    document.getElementById('calculateBtn').addEventListener('click', calculateUnits);
    document.getElementById('timeTable').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            removeRow(e.target);
        }
    });

    function addRow() {
        rowCount++;
        const tableBody = document.querySelector("#timeTable tbody");
        const newRow = document.createElement("tr");

        const startTimeId = `startTime-${rowCount}`;
        const endTimeId = `endTime-${rowCount}`;
        const breakTimeId = `breakTime-${rowCount}`;

        newRow.innerHTML = `
            <td>
                <label for="${startTimeId}" class="sr-only">Start Time</label>
                <input type="time" id="${startTimeId}" name="startTime[]" aria-label="Start Time">
            </td>
            <td>
                <label for="${endTimeId}" class="sr-only">End Time</label>
                <input type="time" id="${endTimeId}" name="endTime[]" aria-label="End Time">
            </td>
            <td>
                <label for="${breakTimeId}" class="sr-only">Break Time (minutes)</label>
                <input type="number" id="${breakTimeId}" name="breakTime[]" aria-label="Break Time" min="0" value="0">
            </td>
            <td>
                <button type="button" class="remove-btn" aria-label="Remove this time entry">Remove</button>
            </td>
        `;

        tableBody.appendChild(newRow);
    }

    function removeRow(button) {
        const row = button.closest("tr");
        const tableBody = document.querySelector("#timeTable tbody");
        if (tableBody.rows.length > 1) {
            tableBody.removeChild(row);
        } else {
            clearRowInputs(row);
        }
    }

    function clearRowInputs(row) {
        const inputs = row.querySelectorAll('input[type="time"], input[type="number"]');
        inputs.forEach(input => input.value = input.type === 'number' ? '0' : '');
    }

    function calculateUnits() {
        const resultDiv = document.getElementById('result');
        const rows = document.querySelectorAll("#timeTable tbody tr");

        let totalUnits = 0;
        let totalDuration = 0;
        let validEntries = true;
        let errorMessages = [];
        let timeIntervals = [];

        rows.forEach((row, index) => {
            const startTime = row.querySelector('input[name="startTime[]"]').value;
            const endTime = row.querySelector('input[name="endTime[]"]').value;
            const breakTime = parseInt(row.querySelector('input[name="breakTime[]"]').value, 10);

            if (!startTime || !endTime) {
                validEntries = false;
                errorMessages.push(`Row ${index + 1}: Start time and end time are required.`);
                return;
            }

            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);

            if (endMinutes <= startMinutes) {
                validEntries = false;
                errorMessages.push(`Row ${index + 1}: End time must be after start time.`);
                return;
            }

            const duration = endMinutes - startMinutes - breakTime;
            if (duration <= 0) {
                validEntries = false;
                errorMessages.push(`Row ${index + 1}: Break time cannot be greater than or equal to the session duration.`);
                return;
            }

            timeIntervals.push({ start: startMinutes, end: endMinutes });
            const baseUnits = Math.floor(duration / 15);
            const remainder = duration % 15;
            let units = baseUnits;

            if (remainder >= 7) {
                units += 1;
            }

            totalUnits += units;
            totalDuration += duration;
        });

        if (validEntries) {
            const overlaps = checkOverlaps(timeIntervals);
            if (overlaps.length > 0) {
                validEntries = false;
                overlaps.forEach(pair => {
                    errorMessages.push(`Overlap between Row ${pair[0]} and Row ${pair[1]}.`);
                });
            }
        }

        if (!validEntries) {
            resultDiv.innerHTML = `<ul>${errorMessages.map(msg => `<li>${msg}</li>`).join('')}</ul>`;
            return;
        }

        resultDiv.innerHTML = `
            <p>Total units: ${totalUnits}</p>
            <p>Total duration: ${totalDuration} minutes</p>
        `;
    }

    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    }

    function checkOverlaps(intervals) {
        let overlaps = [];
        for (let i = 0; i < intervals.length; i++) {
            for (let j = i + 1; j < intervals.length; j++) {
                if (intervals[i].start < intervals[j].end && intervals[j].start < intervals[i].end) {
                    overlaps.push([i + 1, j + 1]);
                }
            }
        }
        return overlaps;
    }
});