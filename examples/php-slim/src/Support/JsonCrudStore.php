<?php

declare(strict_types=1);

namespace RouteLensExample\Support;

final class JsonCrudStore
{
    public function __construct(private string $filePath, private array $seedData)
    {
        $this->ensureInitialized();
    }

    public function all(string $resource): array
    {
        $data = $this->load();

        return array_values($data[$resource] ?? []);
    }

    public function create(string $resource, array $payload): array
    {
        $data = $this->load();
        $items = $data[$resource] ?? [];
        $item = $this->normalizePayload($items, $payload);
        $items[] = $item;
        $data[$resource] = $items;
        $this->save($data);

        return $item;
    }

    public function update(string $resource, string $id, array $payload, bool $partial = false): ?array
    {
        $data = $this->load();
        $items = $data[$resource] ?? [];

        foreach ($items as $index => $item) {
            if ((string) ($item['id'] ?? '') !== $id) {
                continue;
            }

            $updated = $partial ? array_merge($item, $payload) : array_merge(['id' => $item['id']], $payload);
            $updated['id'] = $item['id'];
            $items[$index] = $updated;
            $data[$resource] = $items;
            $this->save($data);

            return $updated;
        }

        return null;
    }

    public function delete(string $resource, string $id): ?array
    {
        $data = $this->load();
        $items = $data[$resource] ?? [];

        foreach ($items as $index => $item) {
            if ((string) ($item['id'] ?? '') !== $id) {
                continue;
            }

            array_splice($items, $index, 1);
            $data[$resource] = $items;
            $this->save($data);

            return $item;
        }

        return null;
    }

    private function ensureInitialized(): void
    {
        $directory = dirname($this->filePath);

        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        if (!file_exists($this->filePath)) {
            $this->save($this->seedData);
        }
    }

    private function load(): array
    {
        $contents = file_get_contents($this->filePath);

        if ($contents === false || $contents === '') {
            return $this->seedData;
        }

        $decoded = json_decode($contents, true);

        return is_array($decoded) ? $decoded : $this->seedData;
    }

    private function save(array $data): void
    {
        file_put_contents(
            $this->filePath,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }

    private function normalizePayload(array $items, array $payload, ?int $forcedId = null): array
    {
        $id = $forcedId ?? $this->nextId($items);

        return array_merge(['id' => $id], $payload);
    }

    private function nextId(array $items): int
    {
        $max = 0;

        foreach ($items as $item) {
            $max = max($max, (int) ($item['id'] ?? 0));
        }

        return $max + 1;
    }
}
