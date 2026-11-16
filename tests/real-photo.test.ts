import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pickPhoto, realPhotoApiUrl } from '../src/lib/real-photo';

// Shaped like the published iNaturalist /v1/taxa answer. Invented values; not a recording of the live service.
const answer = (photo: unknown, name = 'Dasypus novemcinctus') => ({ total_results: 1, results: [{ id: 1, name: 'Dasypus', default_photo: null }, { id: 2, name, default_photo: photo }] });
const good = { id: 9, license_code: 'cc-by', attribution: '(c) Sample Person, some rights reserved (CC BY)', medium_url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/9/medium.jpg', original_dimensions: { width: 2000, height: 1500 } };

test('a licensed photo is shown with its credit and license', () => {
  const photo = pickPhoto(answer(good), 'Dasypus novemcinctus');
  assert.deepEqual(photo, { url: good.medium_url, credit: good.attribution, license: 'CC-BY', ratio: 2000 / 1500 });
});

test('public-domain (CC0) photos are allowed', () => {
  assert.equal(pickPhoto(answer({ ...good, license_code: 'cc0' }), 'Dasypus novemcinctus')?.license, 'CC0');
});

test('a photo with no license is all rights reserved and is never shown', () => {
  assert.equal(pickPhoto(answer({ ...good, license_code: null }), 'Dasypus novemcinctus'), undefined);
  assert.equal(pickPhoto(answer({ ...good, license_code: 'all-rights-reserved' }), 'Dasypus novemcinctus'), undefined);
});

test('a photo without a credit line is never shown', () => {
  assert.equal(pickPhoto(answer({ ...good, attribution: '  ' }), 'Dasypus novemcinctus'), undefined);
});

test('only the exact species is used, never a look-alike result', () => {
  assert.equal(pickPhoto(answer(good, 'Dasypus kappleri'), 'Dasypus novemcinctus'), undefined);
  assert.ok(pickPhoto(answer(good, 'dasypus NOVEMCINCTUS'), 'Dasypus novemcinctus'));
});

test('photos are only loaded over https from the photo site', () => {
  assert.equal(pickPhoto(answer({ ...good, medium_url: 'http://inaturalist-open-data.s3.amazonaws.com/photos/9/medium.jpg' }), 'Dasypus novemcinctus'), undefined);
  assert.equal(pickPhoto(answer({ ...good, medium_url: 'https://example.org/x.jpg' }), 'Dasypus novemcinctus'), undefined);
  assert.equal(pickPhoto(answer({ ...good, medium_url: 'not a url' }), 'Dasypus novemcinctus'), undefined);
});

test('odd answers fail safe', () => {
  for (const bad of [null, 'x', {}, { results: 'no' }, { results: [null, 3] }, answer(undefined), answer('x')]) {
    assert.equal(pickPhoto(bad, 'Dasypus novemcinctus'), undefined);
  }
  const noSize = pickPhoto(answer({ ...good, original_dimensions: undefined }), 'Dasypus novemcinctus');
  assert.equal(noSize?.ratio, 4 / 3);
});

test('the request names only the species', () => {
  assert.equal(realPhotoApiUrl('Dasypus novemcinctus'), 'https://api.inaturalist.org/v1/taxa?rank=species&per_page=5&q=Dasypus%20novemcinctus');
});
