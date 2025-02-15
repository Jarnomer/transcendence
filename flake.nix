{
  description = "Transcendence Dev Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodePkgs = [
          "typescript"
          "vite"
          "tailwindcss"
          "babylonjs"
          "sqlite3"
        ];
        installNodePkgs = ''
          echo "Installing dependencies: ${builtins.concatStringsSep " " nodePkgs}..."
          npm install --save-dev ${builtins.concatStringsSep " " nodePkgs}
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_23
            sqlite
            fish
          ];
          shellHook = ''
            echo "Launched Transcendence DevShell"
            echo "Using node version: `${pkgs.nodejs_23}/bin/node -v`"
            if [ ! -d "node_modules" ]; then
              if [ ! -f "package.json" ]; then
                echo "Initializing package.json..."
                npm init -y
              fi
              ${installNodePkgs}
            else
              echo "All node packages up-to-date!"
            fi
            exec fish
          '';
        };
      }
    );
}
