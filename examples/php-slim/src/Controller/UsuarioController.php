<?php

declare(strict_types=1);

namespace RouteLensExample\Controller;

use RouteLensExample\Support\SeedData;

final class UsuarioController extends AbstractCrudController
{
    protected function resourceName(): string
    {
        return 'usuarios';
    }

    protected function seedData(): array
    {
        return SeedData::all();
    }
}
