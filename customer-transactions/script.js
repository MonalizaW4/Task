document.addEventListener('DOMContentLoaded', () => {
    const customerTableBody = document.querySelector('#customerTable tbody');
    const searchNameInput = document.querySelector('#searchName');
    const searchAmountInput = document.querySelector('#searchAmount');
    const transactionChartCtx = document.getElementById('transactionChart').getContext('2d');

    let customers = [];
    let transactions = [];
    let filteredTransactions = [];
    let chart;

    const fetchData = async () => {
        try {
            const response = await fetch('https://monalizaw4.github.io/api/db.json');
            const data = await response.json();
            customers = data.customers;
            transactions = data.transactions;
            displayData(transactions);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const displayData = (data) => {
        customerTableBody.innerHTML = '';
        data.forEach(transaction => {
            const customer = customers.find(cust => cust.id === transaction.customer_id); 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${customer ? customer.name : 'Unknown'}</td>
                <td>${transaction.amount}</td>
                <td>${transaction.date}</td>
           `;
            customerTableBody.appendChild(row);
        });
        updateChart(data);
    };

    const updateChart = (data) => {
        const groupedData = data.reduce((acc, curr) => {
            acc[curr.date] = (acc[curr.date] || 0) + curr.amount;
            return acc;
        }, {});

        const labels = Object.keys(groupedData);
        const amounts = Object.values(groupedData);

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(transactionChartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Transaction Amount',
                    data: amounts,
                    borderColor: 'rgba(0, 0, 0, 1)',  // تغيير اللون إلى الأسود
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)', // لون خطوط الشبكة
                            lineWidth: 1 // سماكة خطوط الشبكة
                        },
                        ticks: {
                            color: 'rgba(0, 0, 0, 1)' // لون النص
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)', // لون خطوط الشبكة
                            lineWidth: 1 // سماكة خطوط الشبكة
                        },
                        ticks: {
                            color: 'rgba(0, 0, 0, 1)' // لون النص
                        }
                    }
                }
            }
        });
    };

    searchNameInput.addEventListener('input', () => {
        const searchName = searchNameInput.value.toLowerCase();
        filteredTransactions = transactions.filter(transaction => {
            const customer = customers.find(cust => cust.id === transaction.customer_id); 
            return customer && customer.name.toLowerCase().includes(searchName);
        });
        displayData(filteredTransactions);
    });

    searchAmountInput.addEventListener('input', () => {
        const searchAmount = parseFloat(searchAmountInput.value);
        filteredTransactions = transactions.filter(transaction => transaction.amount === searchAmount);
        displayData(filteredTransactions);
    });

    fetchData();
});