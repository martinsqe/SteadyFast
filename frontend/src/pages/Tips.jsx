import React from 'react';
import './Tips.css';

const Tips = () => {
    const tipsData = [
        {
            icon: "🛞",
            problem: "Flat Tyre",
            solution: "Move to a safe spot, use a jack to lift the car, and replace with a spare or call for assistance."
        },
        {
            icon: "🔋",
            problem: "Dead Battery",
            solution: "Try jump-starting with cables. If it still won't start, the battery might need replacement."
        },
        {
            icon: "🌡️",
            problem: "Engine Overheating",
            solution: "Pull over immediately, turn off the engine, and wait for it to cool before checking coolant levels."
        },
        {
            icon: "⛽",
            problem: "Out of Fuel",
            solution: "Avoid frequent low-fuel driving. If empty, call for fuel delivery or walk to the nearest station."
        },
        {
            icon: "🛑",
            problem: "Brake Failure",
            solution: "Downshift to use engine braking, pump the brakes rapidly, and use the parking brake gently."
        },
        {
            icon: "⚙️",
            problem: "Engine Fault",
            solution: "Stop driving if the 'Check Engine' light is flashing. Get a professional diagnostic as soon as possible."
        }
    ];

    return (
        <div className="tips-container">
            <h1 className="tips-title">Roadside Troubleshooting Tips</h1>
            <div className="tips-grid">
                {tipsData.map((tip, index) => (
                    <div key={index} className="tip-card">
                        <div className="tip-icon">{tip.icon}</div>
                        <h3>{tip.problem}</h3>
                        <p>{tip.solution}</p>
                        <div className="tip-solution">
                            <strong>Quick Solution</strong>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tips;
