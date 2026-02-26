function ThreePillars() {
    return (
        <section className="pillars">
            <div className="section-header">
                <p className="section-tag">WHAT DEFINES US</p>
                <h2>Three Pillars of Zaman Park</h2>
                <div className="divider"></div>
            </div>

            <div className="pillars-grid">
                <div className="pillar-card">
                    <div className="icon-circle">🏛️</div>
                    <h3>History</h3>
                    <p>
                        Zaman Park has been at the center of Pakistan's political landscape,
                        hosting pivotal moments that shaped the nation's democratic journey.
                    </p>
                </div>

                <div className="pillar-card">
                    <div className="icon-circle">⚖️</div>
                    <h3>Politics</h3>
                    <p>
                        From grassroots movements to national leadership, Zaman Park symbolizes
                        the power of people-driven political change and unwavering conviction.
                    </p>
                </div>

                <div className="pillar-card">
                    <div className="icon-circle">⭐</div>
                    <h3>Legacy</h3>
                    <p>
                        More than a location — it's a symbol of resilience, hope, and the ongoing
                        pursuit of justice that resonates with millions across Pakistan.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default ThreePillars;