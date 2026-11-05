<?php

use App\Models\Listing;

test('a listing is approved only with the approved status', function () {
    expect((new Listing)->forceFill(['status' => Listing::STATUS_APPROVED])->isApproved())->toBeTrue()
        ->and((new Listing)->forceFill(['status' => Listing::STATUS_PENDING])->isApproved())->toBeFalse();
});

test('the listing options cover the 27 brazilian states and the 4 property types', function () {
    expect(Listing::STATES)->toHaveCount(27)->each->toHaveLength(2)
        ->and(array_unique(Listing::STATES))->toHaveCount(27)
        ->and(Listing::TYPES)->toBe(['casa-terrea', 'apartamento', 'sobrado', 'imovel-rural'])
        ->and(Listing::DEALS)->toBe(['aluguel', 'venda']);
});
