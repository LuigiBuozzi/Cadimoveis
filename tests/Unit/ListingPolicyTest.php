<?php

use App\Models\Listing;
use App\Models\User;
use App\Policies\ListingPolicy;

function policyUser(int $id, bool $admin = false): User
{
    return (new User)->forceFill(['id' => $id, 'is_admin' => $admin]);
}

function policyListing(int $ownerId, string $status = Listing::STATUS_APPROVED): Listing
{
    return (new Listing)->forceFill(['user_id' => $ownerId, 'status' => $status]);
}

test('everyone can view approved listings', function () {
    expect((new ListingPolicy)->view(policyUser(2), policyListing(1)))->toBeTrue();
});

test('only the owner and administrators can view listings under review', function () {
    $policy = new ListingPolicy;
    $listing = policyListing(1, Listing::STATUS_PENDING);

    expect($policy->view(policyUser(1), $listing))->toBeTrue()
        ->and($policy->view(policyUser(2, admin: true), $listing))->toBeTrue()
        ->and($policy->view(policyUser(2), $listing))->toBeFalse();
});

test('only the owner and administrators can update and delete a listing', function () {
    $policy = new ListingPolicy;
    $listing = policyListing(1);

    expect($policy->update(policyUser(1), $listing))->toBeTrue()
        ->and($policy->delete(policyUser(1), $listing))->toBeTrue()
        ->and($policy->update(policyUser(3, admin: true), $listing))->toBeTrue()
        ->and($policy->delete(policyUser(3, admin: true), $listing))->toBeTrue()
        ->and($policy->update(policyUser(2), $listing))->toBeFalse()
        ->and($policy->delete(policyUser(2), $listing))->toBeFalse();
});

test('only administrators can review and approve listings', function () {
    $policy = new ListingPolicy;
    $listing = policyListing(1, Listing::STATUS_PENDING);

    expect($policy->review(policyUser(3, admin: true)))->toBeTrue()
        ->and($policy->approve(policyUser(3, admin: true), $listing))->toBeTrue()
        ->and($policy->review(policyUser(1)))->toBeFalse()
        ->and($policy->approve(policyUser(1), $listing))->toBeFalse();
});
