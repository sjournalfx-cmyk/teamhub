
const camelToSnake = (obj) => {
    if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
            return obj.map(camelToSnake);
        }
        return obj;
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const newObj = {};
        for (const key in obj) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            newObj[snakeKey] = camelToSnake(obj[key]);
        }
        return newObj;
    }
    return obj;
};

const snakeToCamel = (obj) => {
    if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
            return obj.map(snakeToCamel);
        }
        return obj;
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const newObj = {};
        for (const key in obj) {
            const camelKey = key.replace(/(_\w)/g, k => k[1].toUpperCase());
            newObj[camelKey] = snakeToCamel(obj[key]);
        }
        return newObj;
    }
    return obj;
};

const testGoal = {
    title: 'Test',
    milestones: [
        { id: 'm1', title: 'M1', isCompleted: true, scheduledAt: 123 }
    ]
};

console.log('Original:', JSON.stringify(testGoal, null, 2));
const snake = camelToSnake(testGoal);
console.log('Snake:', JSON.stringify(snake, null, 2));
const camel = snakeToCamel(snake);
console.log('Camel:', JSON.stringify(camel, null, 2));
