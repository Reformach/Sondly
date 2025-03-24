import React, { useState } from 'react';
import axios from 'axios';
import ChartStroke from '../pages/main page components/ChartStroke';

const listTracks = () =>{
    return(
    <section class="chart">
        <h2>Чарт</h2>
        <ol>
            <ChartStroke/>
        </ol>
    </section>
    )
}