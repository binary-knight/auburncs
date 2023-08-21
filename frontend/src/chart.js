import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import axios from 'axios';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#AC63FF', '#63FFAC'];

// For Difficulty
const DifficultyChart = ({ classId, token }) => {
    const [data, setData] = useState([]);
    const chartSize = window.innerWidth < 600 ? 200 : 400;

    const difficultyLabels = ['Very Easy', 'Easy', 'Moderate', 'Difficult', 'Very Difficult'];

    useEffect(() => {
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        axios
            .get(`${process.env.REACT_APP_API_ROUTE}/classes/${classId}/votes`, config)
            .then((response) => {
                const votes = Array.isArray(response.data) ? response.data : [];
                let difficultyCount = Array(5).fill(0);
                votes.forEach(vote => difficultyCount[vote.difficulty - 1] += 1);

                const chartData = difficultyCount.map((count, index) => ({
                    name: difficultyLabels[index],
                    value: count,
                }));

                setData(chartData);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [classId, token]);

    return (
        <PieChart width={chartSize} height={chartSize}>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 50).toFixed(0)}%` : ''}
                outerRadius={chartSize / 7}
                fill="#8884d8"
                dataKey="value"
            >
                {
                    data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
            </Pie>
            <Tooltip />
        </PieChart>
    );
};

// For Quality
const QualityChart = ({ classId, token }) => {
    const [data, setData] = useState([]);
    const chartSize = window.innerWidth < 600 ? 200 : 400;

    const qualityLabels = ['Poor', 'Fair', 'Average', 'Good', 'Excellent'];

    useEffect(() => {
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        axios
            .get(`${process.env.REACT_APP_API_ROUTE}/classes/${classId}/votes`, config)
            .then((response) => {
                const votes = Array.isArray(response.data) ? response.data : [];
                let qualityCount = Array(5).fill(0);
                votes.forEach(vote => qualityCount[vote.quality - 1] += 1);

                const chartData = qualityCount.map((count, index) => ({
                    name: qualityLabels[index],
                    value: count,
                }));

                setData(chartData);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [classId, token]);

    return (
        <PieChart width={chartSize} height={chartSize}>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={chartSize / 7}
                fill="#8884d8"
                dataKey="value"
            >
                {
                    data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
            </Pie>
            <Tooltip />
        </PieChart>
    );
};

// For HPW
const HPWChart = ({ classId, token }) => {
    const [data, setData] = useState([]);
    const chartSize = window.innerWidth < 600 ? 200 : 400;

    useEffect(() => {
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        axios
            .get(`${process.env.REACT_APP_API_ROUTE}/classes/${classId}/votes`, config)
            .then((response) => {
                const votes = Array.isArray(response.data) ? response.data : [];
                let hpwCount = Array(4).fill(0);
                votes.forEach(vote => hpwCount[vote.hpw - 1] += 1);

                const chartData = hpwCount.map((count, index) => {
                    let name;
                    switch (index + 1) {
                        case 1:
                            name = '1-10 hours';
                            break;
                        case 2:
                            name = '10-20 hours';
                            break;
                        case 3:
                            name = '20-30 hours';
                            break;
                        case 4:
                            name = '30+ hours';
                            break;
                        default:
                            name = 'Unknown';
                    }
                    return {
                        name: name,
                        value: count,
                    };
                });

                setData(chartData);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [classId, token]);

    return (
        <PieChart width={chartSize} height={chartSize}>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={chartSize / 7}
                fill="#8884d8"
                dataKey="value"
            >
                {
                    data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
            </Pie>
            <Tooltip />
        </PieChart>
    );
};

//Grade
const GradeChart = ({ classId, token }) => {
    const [data, setData] = useState([]);
    const chartSize = window.innerWidth < 600 ? 200 : 400;

    const gradeLabels = ['DNF', 'F', 'D', 'C', 'B', 'A'];

    useEffect(() => {
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        axios
            .get(`${process.env.REACT_APP_API_ROUTE}/classes/${classId}/votes`, config)
            .then((response) => {
                const votes = Array.isArray(response.data) ? response.data : [];
                let gradeCount = Array(6).fill(0);
                votes.forEach(vote => gradeCount[vote.grade] += 1); // index from 0 for 'DNF'

                const chartData = gradeCount.map((count, index) => ({
                    name: gradeLabels[index],
                    value: count,
                }));

                setData(chartData);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [classId, token]);

    return (
        <PieChart width={chartSize} height={chartSize}>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={chartSize / 7}
                fill="#8884d8"
                dataKey="value"
            >
                {
                    data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
            </Pie>
            <Tooltip />
        </PieChart>
    );
};

export { DifficultyChart, QualityChart, HPWChart, GradeChart };


