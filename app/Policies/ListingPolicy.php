<?php

namespace App\Policies;

use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    /**
     * Listings under review are only visible to the owner and administrators.
     */
    public function view(User $user, Listing $listing): bool
    {
        return $listing->isApproved() || $this->update($user, $listing);
    }

    /**
     * Only the owner of the listing and administrators can change it.
     */
    public function update(User $user, Listing $listing): bool
    {
        return $user->is_admin || $user->id === $listing->user_id;
    }

    /**
     * Only the owner of the listing and administrators can delete it.
     */
    public function delete(User $user, Listing $listing): bool
    {
        return $this->update($user, $listing);
    }

    /**
     * Only administrators can see the listings waiting for review.
     */
    public function review(User $user): bool
    {
        return $user->is_admin;
    }

    /**
     * Only administrators can approve listings.
     */
    public function approve(User $user, Listing $listing): bool
    {
        return $user->is_admin;
    }
}
