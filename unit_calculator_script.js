document.addEventListener('DOMContentLoaded', () => {
    let rowCount = 1;

    const cptCodes = [
        {
            activity: "Initial Evaluation",
            code: "97161",
            description: "PT Evaluation - Low Complexity",
            unitRule: {
                baseDuration: 15, // minutes per unit
                unitIncrement: 15, // minutes to round up
            }
        },
        {
            activity: "Therapeutic Exercise",
            code: "97110",
            description: "Therapeutic Exercise",
            unitRule: {
                baseDuration: 15,
                unitIncrement: 15,
            }
        },
        {
            activity: "Manual Therapy",
            code: "97140",
            description: "Manual Therapy Techniques",
            unitRule: {
                baseDuration: 15,
                unitIncrement: 15,
            }
        },
        // Add more activities as needed
    ];

    const activityTable = document.getElementById('activityTable');

    // Populate activity dropdown
    function populateActivityDropdown(selectElement) {
        selectElement.innerHTML = '<option value="">Select Activity</option>' + 
            cptCodes.map((cpt, index) => `<option value="${index}">${cpt.activity}</option>`).join('');
    }

    // Add event listeners to existing and new rows
    function addEventListeners(row) {
        const activitySelect = row.querySelector('select[name="activity[]"]');
        const durationInput = row.querySelector('input[name="duration[]"]');
        const cptCodeInput = row.querySelector('input[name="cptCode[]"]');
        const unitsInput = row.querySelector('input[name="units[]"]');

        activitySelect.addEventListener('change', () => {
            const selectedIndex = activitySelect.value;
            if (selectedIndex !== "") {
                const selectedCPT = cptCodes[selectedIndex];
                cptCodeInput.value = selectedCPT.code;
            } else {
                cptCodeInput.value = '';
                unitsInput.value = '';
            }
        });

        durationInput.addEventListener('input', () => {
            calculateUnit(row);
        });

        // Remove button event
        row.querySelector('.remove-btn').addEventListener('click', () => {
            removeRow(row);
        });
    }

    // Add initial event listeners
    const initialRow = activityTable.querySelector('tbody tr');
    addEventListeners(initialRow);

    // Add new row
    document.getElementById('addRowBtn').addEventListener('click', () => {
        rowCount++;
        const tableBody = activityTable.querySelector('tbody');
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>
                <label for="activity-${rowCount}" class="sr-only">Activity Type</label>
                <select id="activity-${rowCount}" name="activity[]" aria-label="Activity Type" required>
                    <option value="">Select Activity</option>
                    ${cptCodes.map((cpt, index) => `<option value="${index}">${cpt.activity}</option>`).join('')}
                </select>
            </td>
            <td>
                <label for="duration-${rowCount}" class="sr-only">Duration</label>
                <input type="number" id="duration-${rowCount}" name="duration[]" aria-label="Duration" min="1" required>
            </td>
            <td>
                <input type="text" id="cptCode-${rowCount}" name="cptCode[]" aria-label="CPT Code" readonly>
            </td>
            <td>
                <input type="number" id="units-${rowCount}" name="units[]" aria-label="Units" readonly>
            </td>
            <td>
                <button type="button" class="remove-btn" aria-label="Remove this activity">Remove</button>
            </td>
        `;

        tableBody.appendChild(newRow);
        addEventListeners(newRow);
    });

    // Remove row function
    function removeRow(row) {
        const tableBody = activityTable.querySelector('tbody');
        if (tableBody.rows.length > 1) {
            tableBody.removeChild(row);
        } else {
            clearRowInputs(row);
        }
    }

    // Clear inputs if only one row remains
    function clearRowInputs(row) {
        row.querySelector('select[name="activity[]"]').value = "";
        row.querySelector('input[name="duration[]"]').value = "";
        row.querySelector('input[name="cptCode[]"]').value = "";
        row.querySelector('input[name="units[]"]').value = "";
    }

    // Calculate units for a row
    function calculateUnit(row) {
        const activitySelect = row.querySelector('select[name="activity[]"]');
        const durationInput = row.querySelector('input[name="duration[]"]');
        const unitsInput = row.querySelector('input[name="units[]"]');

        const selectedIndex = activitySelect.value;
        const duration = parseInt(durationInput.value, 10);

        if (selectedIndex !== "" && !isNaN(duration) && duration > 0) {
            const selectedCPT = cptCodes[selectedIndex];
            const { baseDuration, unitIncrement } = selectedCPT.unitRule;
            const units = Math.ceil(duration / unitIncrement);
            unitsInput.value = units;
        } else {
            unitsInput.value = "";
        }
    }

    // Calculate total units
    document.getElementById('calculateUnitsBtn').addEventListener('click', () => {
        const rows = activityTable.querySelectorAll('tbody tr');
        let totalUnits = 0;
        let valid = true;
        let errorMessages = [];

        rows.forEach((row, index) => {
            const activitySelect = row.querySelector('select[name="activity[]"]').value;
            const duration = parseInt(row.querySelector('input[name="duration[]"]').value, 10);
            const units = parseInt(row.querySelector('input[name="units[]"]').value, 10);

            if (activitySelect === "" || isNaN(duration) || duration <= 0) {
                valid = false;
                errorMessages.push(`Row ${index + 1}: Please select an activity and enter a valid duration.`);
            } else if (isNaN(units) || units <= 0) {
                valid = false;
                errorMessages.push(`Row ${index + 1}: Unable to calculate units. Please check the inputs.`);
            } else {
                totalUnits += units;
            }
        });

        const resultDiv = document.getElementById('unitResult');
        if (valid) {
            resultDiv.innerHTML = `<p>Total Units: <strong>${totalUnits}</strong></p>`;
            // Optionally, store the total units for revenue projection
            sessionStorage.setItem('totalUnits', totalUnits);
        } else {
            resultDiv.innerHTML = `<ul>${errorMessages.map(msg => `<li>${msg}</li>`).join('')}</ul>`;
        }
    });
});
