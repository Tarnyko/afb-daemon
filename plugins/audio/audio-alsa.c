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

#include "audio-api.h"
#include "audio-alsa.h"

PUBLIC unsigned char _alsa_init (const char *name, audioCtxHandleT *ctx) {

    snd_pcm_t *dev;
    snd_pcm_hw_params_t *params;
    snd_mixer_t *mixer;
    snd_mixer_selem_id_t *mixer_sid;
    snd_mixer_elem_t *mixer_elm;
    unsigned int rate = 22050;
    long vol, vol_min, vol_max;
    int num;

    if (snd_pcm_open (&dev, name, SND_PCM_STREAM_PLAYBACK, 0) < 0)
        return 0;

    snd_pcm_hw_params_malloc (&params);
    snd_pcm_hw_params_any (dev, params);
    snd_pcm_hw_params_set_access (dev, params, SND_PCM_ACCESS_RW_INTERLEAVED);
    snd_pcm_hw_params_set_format (dev, params, SND_PCM_FORMAT_S16_LE);
    snd_pcm_hw_params_set_rate_near (dev, params, &rate, 0);
    snd_pcm_hw_params_set_channels (dev, params, ctx->channels);
    if (snd_pcm_hw_params (dev, params) < 0) {
        snd_pcm_hw_params_free (params);
        return 0;
    }
    snd_pcm_prepare (dev);

    snd_mixer_open (&mixer, 0);
    if (snd_mixer_attach (mixer, name) < 0) {
        snd_pcm_hw_params_free (params);
        return 0;
    }
    snd_mixer_selem_register (mixer, NULL, NULL);
    snd_mixer_load (mixer);

    snd_mixer_selem_id_alloca (&mixer_sid);
    snd_mixer_selem_id_set_index (mixer_sid, 0);
    snd_mixer_selem_id_set_name (mixer_sid, "Master");

    mixer_elm = snd_mixer_find_selem (mixer, mixer_sid);
    if (mixer_elm) {
        snd_mixer_selem_get_playback_volume_range (mixer_elm, &vol_min, &vol_max);
        snd_mixer_selem_get_playback_volume (mixer_elm, SND_MIXER_SCHN_FRONT_LEFT, &vol);
    }

    /* allocate the global array if it hasn't been done */
    if (!adev_ctx) {
        adev_ctx = (adev_ctx_T**) malloc (sizeof(adev_ctx_T));
        adev_ctx[0] = (adev_ctx_T*) malloc (sizeof(adev_ctx_T));
        adev_ctx[0]->name = NULL;
        adev_ctx[0]->dev = NULL;
    }

    /* is a card with similar name already opened ? */
    for (num = 0; num < (sizeof(adev_ctx)/sizeof(adev_ctx_T)); num++) {
        if (adev_ctx[num]->name &&
           !strcmp (adev_ctx[num]->name, name))
            return 0;
    }
    num++;

    /* it's not... let us add it to the global array */
    adev_ctx = (adev_ctx_T**) realloc (adev_ctx, (num+1)*sizeof(adev_ctx_T));
    adev_ctx[num] = (adev_ctx_T*) malloc (sizeof(adev_ctx_T));
    adev_ctx[num]->name = strdup (name);
    adev_ctx[num]->dev = dev;
    adev_ctx[num]->params = params;
    adev_ctx[num]->mixer_elm = mixer_elm;
    adev_ctx[num]->vol_max = vol_max;
    adev_ctx[num]->vol = vol;

    /* make the client context aware of current card state */
    ctx->volume = _alsa_get_volume (num);
    ctx->mute = _alsa_get_mute (num);
    ctx->idx = num;

    return 1;
}

PUBLIC void _alsa_free (const char *name) {

    int num;

    for (num = 0; num < (sizeof(adev_ctx)/sizeof(adev_ctx_T)); num++) {
        if (adev_ctx[num]->name &&
           !strcmp (adev_ctx[num]->name, name)) {
            snd_pcm_close (adev_ctx[num]->dev);
            snd_pcm_hw_params_free (adev_ctx[num]->params);
            free (adev_ctx[num]->name);
            adev_ctx[num]->name = NULL;
            adev_ctx[num]->dev = NULL;
            free(adev_ctx[num]);
            return;
        }
    }
}

PUBLIC void _alsa_play (unsigned int num, void *buf, int len) {

    if (!adev_ctx || !adev_ctx[num]) {
        return;
    }
    int16_t *cbuf = (int16_t *)buf;
    int frames = len / 2;
    int res;

    if ((res = snd_pcm_writei (adev_ctx[num]->dev, cbuf, frames)) != frames) {
        snd_pcm_recover (adev_ctx[num]->dev, res, 0);
        snd_pcm_prepare (adev_ctx[num]->dev);
    }
    /* snd_pcm_drain (adev_ctx[num]->dev); */
}

PUBLIC unsigned int _alsa_get_volume (unsigned int num) {

    if (!adev_ctx || !adev_ctx[num] || !adev_ctx[num]->mixer_elm)
        return;

    snd_mixer_selem_get_playback_volume (adev_ctx[num]->mixer_elm, SND_MIXER_SCHN_FRONT_LEFT, &adev_ctx[num]->vol);

    return (unsigned int)(adev_ctx[num]->vol*100)/adev_ctx[num]->vol_max;
}

PUBLIC unsigned int _alsa_set_volume (unsigned int num, unsigned int vol) {

    if (!adev_ctx || !adev_ctx[num] || !adev_ctx[num]->mixer_elm || vol > 100)
        return;

   snd_mixer_selem_set_playback_volume_all (adev_ctx[num]->mixer_elm, (vol*adev_ctx[num]->vol_max)/100);
}

PUBLIC unsigned char _alsa_get_mute (unsigned int num) {

    int mute = 0;

    if (!adev_ctx || !adev_ctx[num] || !adev_ctx[num]->mixer_elm)
        return;

    if (snd_mixer_selem_has_playback_switch (adev_ctx[num]->mixer_elm)) {
        snd_mixer_selem_get_playback_switch (adev_ctx[num]->mixer_elm, SND_MIXER_SCHN_FRONT_LEFT, &mute); 
        snd_mixer_selem_get_playback_switch (adev_ctx[num]->mixer_elm, SND_MIXER_SCHN_FRONT_RIGHT, &mute); 

    }

    return (unsigned char)!mute;
}

PUBLIC void _alsa_set_mute (unsigned int num, unsigned char mute) {

    if (!adev_ctx || !adev_ctx[num] || !adev_ctx[num]->mixer_elm || 1 < mute < 0)
        return;

    if (snd_mixer_selem_has_playback_switch (adev_ctx[num]->mixer_elm))
        snd_mixer_selem_set_playback_switch_all (adev_ctx[num]->mixer_elm, !mute);
}

PUBLIC void _alsa_set_rate (unsigned int num, unsigned int rate) {

    if (!adev_ctx || !adev_ctx[num])
        return;

    snd_pcm_hw_params_set_rate_near (adev_ctx[num]->dev, adev_ctx[num]->params, &rate, 0);
}

PUBLIC void _alsa_set_channels (unsigned int num, unsigned int channels) {

    if (!adev_ctx || !adev_ctx[num])
        return;

    snd_pcm_hw_params_set_channels (adev_ctx[num]->dev, adev_ctx[num]->params, channels);
}