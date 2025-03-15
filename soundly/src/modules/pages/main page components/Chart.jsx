import ChartStroke from "./ChartStroke";

const Chart = () => {
    return(
    <section class="chart">
        <h2>Чарт</h2>
        <ol className="chart-list">
            <ChartStroke/>
            <ChartStroke/>
        </ol> 
    </section>
    );
}
export default Chart;