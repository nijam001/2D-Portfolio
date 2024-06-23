//act as root file

import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    build:{
        minify : "terser"
    }
})