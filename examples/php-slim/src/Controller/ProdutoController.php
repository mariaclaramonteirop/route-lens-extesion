<?php

declare(strict_types=1);

namespace RouteLensExample\Controller;

use RouteLensExample\Support\SeedData;

final class ProdutoController extends AbstractCrudController
{
    protected function resourceName(): string
    {
        return 'produtos';
    }

    protected function seedData(): array
    {
        return SeedData::all();
    }
}
