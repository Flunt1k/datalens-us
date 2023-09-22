require('dotenv').config();
require('../../index');
import {helpers} from '../index';

helpers
    .rollbackDatabase()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
