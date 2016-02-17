/*
 * Copyright (C) 2015 "IoT.bzh"
 * Author "Manuel Bachmann"
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

#ifndef AUDIO_API_H
#define AUDIO_API_H

#include "audio-alsa.h"
#ifdef HAVE_PULSE
#include "audio-pulse.h"
#endif

/* global plugin handle, should store everything we may need */
typedef struct {
  int devCount;
} pluginHandleT;

/* private client context [will be destroyed when client leaves] */
typedef struct {
  void *audio_dev;          /* handle to implementation (ALSA, PulseAudio...) */
  int idx;                  /* audio card index within global array           */
  int volume[8];            /* audio volume (8 channels) : 0-100              */
  unsigned int channels;    /* audio channels : 1(mono)/2(stereo)...          */
  unsigned char mute;       /* audio muted : 0(false)/1(true)                 */
  unsigned char is_playing; /* audio is playing: 0(false)/1(true)             */
} audioCtxHandleT;


#endif /* AUDIO_API_H */