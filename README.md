# YM-WEB Chiptune music player

## The hardware: AY-3-8910 and YM2149F

### History

The YM2149F is a Programmable Sound Generator (PSG) manufactured by Yamaha, virtually identical to the General Instrument AY-3-8910, released in 1978. These chips were used in 8-bit computers such as the Atari, C64, MSX, and ZX Spectrum-128.

### Characteristics:

- 3 tone channels with ADSR envelope (Attack, Decay, Sustain, Release)
- 1 noise channel
- 1 tone/noise mix channel
- Range: 30 Hz to 125 kHz

### Arquitectura

El diagrama de bloques de alto nivel se muestra en la siguiente figura.

<div align="center">
<img src="ay38910/docs/8910-diag.png" width="80%">
</div>


El funcionamiento del PSG AY-3-8910 se basa en el uso de 14 registros, que se encargan de controlar las frecuencias de cada canal, del ruido, la ganancia de cada canal y las características de la envolvente que se requiere configurar.

<div align="center">
<img src="ay38910/docs/registers.png" width="80%">
</div>


## YM file format

http://leonard.oxg.free.fr/


## LICENSE TERMS

### YM WEB PLAYER

```
ym-web-player - Copyright (C) 2026  Gabriel Astudillo Muñoz

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```

### AYM·JS

<a href="https://github.com/ponceto/aym-js">AYM JS</a> is released under the terms of the General Public License version 2.

```
aym-js - Copyright (c) 2001-2025 - Olivier Poncet

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```

### FONTAWESOME

This project is distributed with [fontawesome](https://fontawesome.com/), an icon library and toolkit.

```
Font Awesome Free License

Font Awesome Free is free, open source, and GPL friendly. You can use it for
commercial projects, open source projects, or really almost whatever you want.
Full Font Awesome Free license: https://fontawesome.com/license/free.
```

### PICO·CSS

This project is distributed with [pico·css](https://picocss.com/), a tiny and elegant css library.

```
MIT License

Copyright (c) 2019-2023 Pico

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
